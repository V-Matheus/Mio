import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { catalogError } from "./errors/catalog.errors"

interface LessonRecord {
  id: bigint
  slug: string
  title: string
  position: number
}

interface SectionRecord {
  id: bigint
  slug: string
  title: string
  position: number
  kind: string
  contentMarkdown: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

@Injectable()
export class CatalogAdminService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserIdByCode(code: string): Promise<bigint> {
    const user = await this.prisma.user.findUnique({
      where: { code },
      select: { id: true },
    })
    if (!user) {
      throw catalogError("USER_NOT_FOUND")
    }
    return user.id
  }

  private async assertTrackOwnership(
    trackSlug: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.prisma.track.findUnique({
      where: { slug: trackSlug },
      include: { creator: { select: { code: true } } },
    })
    if (!track) {
      throw catalogError("TRACK_NOT_FOUND")
    }
    if (requestorRole !== "ADMIN" && track.creator?.code !== requestorCode) {
      throw catalogError("FORBIDDEN")
    }
    return track
  }

  async listAdminTracks(requestorCode: string, requestorRole: string) {
    const where =
      requestorRole === "ADMIN" ? {} : { creator: { code: requestorCode } }

    const tracks = await this.prisma.track.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { code: true } },
        _count: { select: { lessons: true } },
      },
    })

    return tracks.map((track) => ({
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      creatorCode: track.creator?.code ?? "",
      lessonCount: track._count.lessons,
    }))
  }

  async getAdminTrack(
    slug: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnership(
      slug,
      requestorCode,
      requestorRole,
    )
    const fullTrack = await this.prisma.track.findUnique({
      where: { id: track.id },
      include: {
        creator: { select: { code: true } },
        lessons: {
          orderBy: { position: "asc" },
          include: {
            sections: { orderBy: { position: "asc" } },
          },
        },
      },
    })
    if (!fullTrack) throw catalogError("TRACK_NOT_FOUND")

    return {
      slug: fullTrack.slug,
      title: fullTrack.title,
      description: fullTrack.description ?? "",
      creatorCode: fullTrack.creator?.code ?? "",
      lessons: fullTrack.lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        position: lesson.position,
        sections: lesson.sections.map((sec) => ({
          slug: sec.slug,
          title: sec.title,
          position: sec.position,
          kind: sec.kind,
          contentMarkdown: sec.contentMarkdown,
        })),
      })),
    }
  }

  async createTrack(title: string, description: string, requestorCode: string) {
    const creatorId = await this.getUserIdByCode(requestorCode)
    const baseSlug = slugify(title) || `track-${Date.now()}`

    // Garantir slug único
    let slug = baseSlug
    let counter = 1
    while (await this.prisma.track.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const track = await this.prisma.track.create({
      data: {
        title,
        description,
        slug,
        creatorId,
      },
      include: { creator: { select: { code: true } } },
    })

    return {
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      creatorCode: track.creator?.code ?? "",
      lessonCount: 0,
    }
  }

  async updateTrack(
    currentSlug: string,
    title: string,
    description: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnership(
      currentSlug,
      requestorCode,
      requestorRole,
    )
    const newSlug = slugify(title) || track.slug

    const updated = await this.prisma.track.update({
      where: { id: track.id },
      data: {
        title,
        description,
        slug: newSlug,
      },
      include: {
        creator: { select: { code: true } },
        _count: { select: { lessons: true } },
      },
    })

    return {
      slug: updated.slug,
      title: updated.title,
      description: updated.description ?? "",
      creatorCode: updated.creator?.code ?? "",
      lessonCount: updated._count.lessons,
    }
  }

  async deleteTrack(
    slug: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnership(
      slug,
      requestorCode,
      requestorRole,
    )
    await this.prisma.track.delete({ where: { id: track.id } })
    return { success: true }
  }

  async upsertLesson(
    trackSlug: string,
    slug: string,
    title: string,
    position: number,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnership(
      trackSlug,
      requestorCode,
      requestorRole,
    )
    const lessonSlug = slug || slugify(title) || `lesson-${Date.now()}`

    const existing = await this.prisma.lesson.findFirst({
      where: { trackId: track.id, slug: lessonSlug },
    })

    let lesson: LessonRecord
    if (existing) {
      lesson = await this.prisma.lesson.update({
        where: { id: existing.id },
        data: { title, position },
      })
    } else {
      const count = await this.prisma.lesson.count({
        where: { trackId: track.id },
      })
      const pos = position || count + 1
      lesson = await this.prisma.lesson.create({
        data: {
          trackId: track.id,
          slug: lessonSlug,
          title,
          position: pos,
        },
      })
    }

    return {
      trackSlug,
      slug: lesson.slug,
      title: lesson.title,
      position: lesson.position,
    }
  }

  async deleteLesson(
    trackSlug: string,
    lessonSlug: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnership(
      trackSlug,
      requestorCode,
      requestorRole,
    )
    const lesson = await this.prisma.lesson.findFirst({
      where: { trackId: track.id, slug: lessonSlug },
    })
    if (lesson) {
      await this.prisma.lesson.delete({ where: { id: lesson.id } })
    }
    return { success: true }
  }

  async upsertSection(
    trackSlug: string,
    lessonSlug: string,
    slug: string,
    title: string,
    position: number,
    kind: "TEXT" | "EXERCISE",
    contentMarkdown: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnership(
      trackSlug,
      requestorCode,
      requestorRole,
    )
    const lesson = await this.prisma.lesson.findFirst({
      where: { trackId: track.id, slug: lessonSlug },
    })
    if (!lesson) {
      throw catalogError("LESSON_NOT_FOUND")
    }

    const sectionSlug = slug || slugify(title) || `sec-${Date.now()}`
    const existing = await this.prisma.section.findFirst({
      where: { lessonId: lesson.id, slug: sectionSlug },
    })

    let section: SectionRecord
    if (existing) {
      section = await this.prisma.section.update({
        where: { id: existing.id },
        data: {
          title,
          position,
          kind: kind === "EXERCISE" ? "EXERCISE" : "TEXT",
          contentMarkdown,
        },
      })
    } else {
      const count = await this.prisma.section.count({
        where: { lessonId: lesson.id },
      })
      const pos = position || count + 1
      section = await this.prisma.section.create({
        data: {
          lessonId: lesson.id,
          slug: sectionSlug,
          title,
          position: pos,
          kind: kind === "EXERCISE" ? "EXERCISE" : "TEXT",
          contentMarkdown,
        },
      })
    }

    return {
      slug: section.slug,
      title: section.title,
      position: section.position,
      kind: section.kind,
      contentMarkdown: section.contentMarkdown,
    }
  }

  async deleteSection(
    trackSlug: string,
    lessonSlug: string,
    sectionSlug: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnership(
      trackSlug,
      requestorCode,
      requestorRole,
    )
    const lesson = await this.prisma.lesson.findFirst({
      where: { trackId: track.id, slug: lessonSlug },
    })
    if (lesson) {
      const section = await this.prisma.section.findFirst({
        where: { lessonId: lesson.id, slug: sectionSlug },
      })
      if (section) {
        await this.prisma.section.delete({ where: { id: section.id } })
      }
    }
    return { success: true }
  }
}
