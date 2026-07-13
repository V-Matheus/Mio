import { PrismaClient, type SectionKind } from ".prisma/core"
import { catalogFixtures } from "./seed-fixtures"

/**
 * Seed do catálogo (spec 02). O conteúdo das seções mora no banco
 * (`Section.contentMarkdown`) — markdown é formato de edição/renderização,
 * nunca arquivo. As fixtures de `seed-fixtures.ts` são material de
 * desenvolvimento/demonstração; em produção o conteúdo será criado pela
 * interface de admin (spec 09).
 *
 * O upsert é idempotente. Reordenações são seguras (as posições atuais são
 * negadas antes da regravação, evitando conflito com os uniques de posição).
 * Entradas que existem no banco mas saíram das fixtures NÃO são apagadas
 * (preservam progresso/matrículas); o script apenas avisa sobre os órfãos.
 *
 * Uso: `yarn seed:content` (no container: `yarn docker:seed:content`).
 */

export type SectionEntry = {
  slug: string
  title: string
  position: number
  kind: SectionKind
  contentMarkdown: string
}

export type LessonEntry = {
  slug: string
  title: string
  position: number
  sections: SectionEntry[]
}

export type TrackEntry = {
  slug: string
  title: string
  description: string | null
  lessons: LessonEntry[]
}

export type SyncSummary = {
  tracks: number
  lessons: number
  sections: number
}

/** Falha cedo se as fixtures violarem os invariantes do schema. */
export function validateFixtures(tracks: TrackEntry[]): void {
  assertUnique(
    tracks.map((track) => track.slug),
    "slugs de trilha duplicados",
  )
  for (const track of tracks) {
    assertUnique(
      track.lessons.map((lesson) => lesson.slug),
      `slugs de lição duplicados na trilha "${track.slug}"`,
    )
    assertUnique(
      track.lessons.map((lesson) => lesson.position),
      `posições de lição duplicadas na trilha "${track.slug}"`,
    )
    for (const lesson of track.lessons) {
      const label = `${track.slug}/${lesson.slug}`
      requirePosition(lesson.position, label)
      assertUnique(
        lesson.sections.map((section) => section.slug),
        `slugs de seção duplicados na lição "${label}"`,
      )
      assertUnique(
        lesson.sections.map((section) => section.position),
        `posições de seção duplicadas na lição "${label}"`,
      )
      for (const section of lesson.sections) {
        requirePosition(section.position, `${label}/${section.slug}`)
        if (section.contentMarkdown.trim().length === 0) {
          throw new Error(`Conteúdo vazio na seção "${label}/${section.slug}"`)
        }
      }
    }
  }
}

export async function syncContent(
  prisma: PrismaClient,
  tracks: TrackEntry[],
  adminPasswordHash: string,
): Promise<SyncSummary> {
  const summary: SyncSummary = { tracks: 0, lessons: 0, sections: 0 }

  // 1. Garantir que as roles padrões existam
  await prisma.role.upsert({
    where: { name: "STUDENT" },
    update: {},
    create: { name: "STUDENT" },
  })
  await prisma.role.upsert({
    where: { name: "TEACHER" },
    update: {},
    create: { name: "TEACHER" },
  })
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  })

  // 2. Garantir o administrador do sistema
  const defaultAdmin = await prisma.user.upsert({
    where: { code: "system-admin" },
    // update também garante a senha em admins já criados sem passwordHash
    update: { passwordHash: adminPasswordHash },
    create: {
      code: "system-admin",
      email: "admin@mio.dev",
      name: "System Admin",
      passwordHash: adminPasswordHash,
    },
  })

  // 3. Associar admin com a role ADMIN
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: defaultAdmin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: defaultAdmin.id,
      roleId: adminRole.id,
    },
  })

  await warnOrphanTracks(prisma, tracks)

  for (const track of tracks) {
    await prisma.$transaction(async (tx) => {
      const dbTrack = await tx.track.upsert({
        where: { slug: track.slug },
        create: {
          slug: track.slug,
          title: track.title,
          description: track.description,
          creatorId: defaultAdmin.id,
        },
        update: { title: track.title, description: track.description },
      })
      summary.tracks += 1

      await warnOrphans(
        tx.lesson.findMany({
          where: {
            trackId: dbTrack.id,
            slug: { notIn: track.lessons.map((lesson) => lesson.slug) },
          },
          select: { slug: true },
        }),
        `lições órfãs na trilha "${track.slug}" (existem no banco, não nas fixtures)`,
      )

      // Duas fases: nega as posições atuais antes de regravar, para que
      // reordenações não violem o unique(trackId, position) no meio do loop.
      await tx.lesson.updateMany({
        where: {
          trackId: dbTrack.id,
          slug: { in: track.lessons.map((lesson) => lesson.slug) },
        },
        data: { position: { multiply: -1 } },
      })

      for (const lesson of track.lessons) {
        const dbLesson = await tx.lesson.upsert({
          where: { trackId_slug: { trackId: dbTrack.id, slug: lesson.slug } },
          create: {
            trackId: dbTrack.id,
            slug: lesson.slug,
            title: lesson.title,
            position: lesson.position,
          },
          update: { title: lesson.title, position: lesson.position },
        })
        summary.lessons += 1

        await warnOrphans(
          tx.section.findMany({
            where: {
              lessonId: dbLesson.id,
              slug: { notIn: lesson.sections.map((section) => section.slug) },
            },
            select: { slug: true },
          }),
          `seções órfãs na lição "${track.slug}/${lesson.slug}"`,
        )

        await tx.section.updateMany({
          where: {
            lessonId: dbLesson.id,
            slug: { in: lesson.sections.map((section) => section.slug) },
          },
          data: { position: { multiply: -1 } },
        })

        for (const section of lesson.sections) {
          await tx.section.upsert({
            where: {
              lessonId_slug: { lessonId: dbLesson.id, slug: section.slug },
            },
            create: {
              lessonId: dbLesson.id,
              slug: section.slug,
              title: section.title,
              position: section.position,
              kind: section.kind,
              contentMarkdown: section.contentMarkdown,
            },
            update: {
              title: section.title,
              position: section.position,
              kind: section.kind,
              contentMarkdown: section.contentMarkdown,
            },
          })
          summary.sections += 1
        }
      }
    })
  }

  return summary
}

async function warnOrphanTracks(
  prisma: PrismaClient,
  tracks: TrackEntry[],
): Promise<void> {
  await warnOrphans(
    prisma.track.findMany({
      where: { slug: { notIn: tracks.map((track) => track.slug) } },
      select: { slug: true },
    }),
    "trilhas órfãs (existem no banco, não nas fixtures)",
  )
}

async function warnOrphans(
  query: Promise<{ slug: string }[]>,
  message: string,
): Promise<void> {
  const orphans = await query
  if (orphans.length > 0) {
    console.warn(
      `⚠ ${message}: ${orphans.map((orphan) => orphan.slug).join(", ")}`,
    )
  }
}

function assertUnique(values: (string | number)[], message: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(message)
  }
}

function requirePosition(value: number, origin: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Posição inválida em ${origin} (esperava inteiro >= 1)`)
  }
}

async function main(): Promise<void> {
  const adminPasswordHash = process.env.DEV_ADMIN_PASSWORD_HASH
  if (!adminPasswordHash) {
    throw new Error(
      "A variável de ambiente DEV_ADMIN_PASSWORD_HASH é obrigatória para executar o seed.",
    )
  }

  validateFixtures(catalogFixtures)

  const prisma = new PrismaClient()
  try {
    const summary = await syncContent(
      prisma,
      catalogFixtures,
      adminPasswordHash,
    )
    console.log(
      `Seed concluído: ${summary.tracks} trilha(s), ${summary.lessons} lição(ões), ${summary.sections} seção(ões).`,
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Seed falhou: ${(error as Error).message}`)
    process.exitCode = 1
  })
}
