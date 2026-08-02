import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { catalogError } from "./errors/catalog.errors"

interface LessonRecord {
  id: number
  slug: string
  title: string
  position: number
}

interface SectionRecord {
  id: number
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

  private async getUserIdByCode(code: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { code },
      select: { id: true },
    })
    if (!user) {
      throw catalogError("USER_NOT_FOUND")
    }
    return user.id
  }

  private async assertTrackOwnershipById(
    trackId: number,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
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

  private async assertTrackOwnershipBySlug(
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
        category: true,
        _count: { select: { lessons: true } },
      },
    })

    return tracks.map((track) => ({
      id: track.id,
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      creatorCode: track.creator?.code ?? "",
      category: track.category
        ? {
            id: String(track.category.id),
            slug: track.category.slug,
            name: track.category.name,
            color: track.category.color,
          }
        : null,
      lessonCount: track._count.lessons,
    }))
  }

  async getAdminTrack(
    slug: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnershipBySlug(
      slug,
      requestorCode,
      requestorRole,
    )
    const fullTrack = await this.prisma.track.findUnique({
      where: { id: track.id },
      include: {
        creator: { select: { code: true } },
        category: true,
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
      id: fullTrack.id,
      slug: fullTrack.slug,
      title: fullTrack.title,
      description: fullTrack.description ?? "",
      creatorCode: fullTrack.creator?.code ?? "",
      category: fullTrack.category
        ? {
            id: String(fullTrack.category.id),
            slug: fullTrack.category.slug,
            name: fullTrack.category.name,
            color: fullTrack.category.color,
          }
        : null,
      lessons: fullTrack.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        position: lesson.position,
        sections: lesson.sections.map((sec) => ({
          id: sec.id,
          slug: sec.slug,
          title: sec.title,
          position: sec.position,
          kind: sec.kind,
          contentMarkdown: sec.contentMarkdown,
        })),
      })),
    }
  }

  async createTrack(
    title: string,
    description: string,
    categoryId: string | number | undefined,
    requestorCode: string,
  ) {
    const creatorId = await this.getUserIdByCode(requestorCode)
    const baseSlug = slugify(title) || `track-${Date.now()}`

    let dbCategoryId: number | null = null
    if (categoryId) {
      const parsed = Number(categoryId)
      if (!Number.isNaN(parsed) && parsed > 0) {
        dbCategoryId = parsed
      }
    }

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
        categoryId: dbCategoryId,
      },
      include: {
        creator: { select: { code: true } },
        category: true,
      },
    })

    return {
      id: track.id,
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      creatorCode: track.creator?.code ?? "",
      category: track.category
        ? {
            id: String(track.category.id),
            slug: track.category.slug,
            name: track.category.name,
            color: track.category.color,
          }
        : null,
      lessonCount: 0,
    }
  }

  async updateTrack(
    trackId: number,
    title: string,
    description: string,
    categoryId: string | number | undefined,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnershipById(
      trackId,
      requestorCode,
      requestorRole,
    )
    const newSlug = slugify(title) || track.slug

    let dbCategoryId = track.categoryId
    if (categoryId !== undefined) {
      if (categoryId) {
        const parsed = Number(categoryId)
        dbCategoryId = !Number.isNaN(parsed) && parsed > 0 ? parsed : null
      } else {
        dbCategoryId = null
      }
    }

    const updated = await this.prisma.track.update({
      where: { id: track.id },
      data: {
        title,
        description,
        slug: newSlug,
        categoryId: dbCategoryId,
      },
      include: {
        creator: { select: { code: true } },
        category: true,
        _count: { select: { lessons: true } },
      },
    })

    return {
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      description: updated.description ?? "",
      creatorCode: updated.creator?.code ?? "",
      category: updated.category
        ? {
            id: String(updated.category.id),
            slug: updated.category.slug,
            name: updated.category.name,
            color: updated.category.color,
          }
        : null,
      lessonCount: updated._count.lessons,
    }
  }

  async deleteTrack(
    trackId: number,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnershipById(
      trackId,
      requestorCode,
      requestorRole,
    )
    await this.prisma.track.delete({ where: { id: track.id } })
    return { success: true }
  }

  async upsertLesson(
    trackId: number,
    lessonId: number | undefined,
    title: string,
    position: number,
    requestorCode: string,
    requestorRole: string,
  ) {
    const track = await this.assertTrackOwnershipById(
      trackId,
      requestorCode,
      requestorRole,
    )

    const existingLessons = await this.prisma.lesson.findMany({
      where: { trackId: track.id },
      select: { id: true, slug: true, position: true },
    })

    const existing = lessonId
      ? existingLessons.find((l) => l.id === lessonId)
      : undefined

    let lessonSlug = existing?.slug || ""
    if (!existing) {
      const baseSlug = slugify(title) || `lesson-${Date.now()}`
      lessonSlug = baseSlug
      let counter = 1
      while (existingLessons.some((l) => l.slug === lessonSlug)) {
        lessonSlug = `${baseSlug}-${counter++}`
      }
    }

    const lessonCount = existingLessons.length
    let targetPosition =
      position && position > 0
        ? position
        : existing
          ? existing.position
          : lessonCount + 1

    let lesson: LessonRecord & { sections?: SectionRecord[] }
    if (existing) {
      lesson = await this.prisma.lesson.update({
        where: { id: existing.id },
        data: { title, position: targetPosition },
        include: { sections: { orderBy: { position: "asc" } } },
      })
    } else {
      if (existingLessons.some((l) => l.position === targetPosition)) {
        targetPosition = lessonCount + 1
      }
      lesson = await this.prisma.lesson.create({
        data: {
          trackId: track.id,
          slug: lessonSlug,
          title,
          position: targetPosition,
        },
        include: { sections: { orderBy: { position: "asc" } } },
      })
    }

    return {
      id: lesson.id,
      trackId: track.id,
      slug: lesson.slug,
      title: lesson.title,
      position: lesson.position,
      sections: (lesson.sections || []).map((s: SectionRecord) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        position: s.position,
        kind: s.kind,
        contentMarkdown: s.contentMarkdown,
      })),
    }
  }

  async deleteLesson(
    lessonId: number,
    requestorCode: string,
    requestorRole: string,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { track: { include: { creator: { select: { code: true } } } } },
    })
    if (!lesson) return { success: true }

    if (
      requestorRole !== "ADMIN" &&
      lesson.track.creator?.code !== requestorCode
    ) {
      throw catalogError("FORBIDDEN")
    }

    await this.prisma.lesson.delete({ where: { id: lessonId } })
    return { success: true }
  }

  async upsertSection(
    lessonId: number,
    sectionId: number | undefined,
    title: string,
    position: number,
    kind: "TEXT" | "EXERCISE",
    contentMarkdown: string,
    requestorCode: string,
    requestorRole: string,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        track: { include: { creator: { select: { code: true } } } },
        sections: { select: { id: true, slug: true, position: true } },
      },
    })
    if (!lesson) {
      throw catalogError("LESSON_NOT_FOUND")
    }

    if (
      requestorRole !== "ADMIN" &&
      lesson.track.creator?.code !== requestorCode
    ) {
      throw catalogError("FORBIDDEN")
    }

    const existing = sectionId
      ? lesson.sections.find((s) => s.id === sectionId)
      : undefined

    let sectionSlug = existing?.slug || ""
    if (!existing) {
      const baseSlug = slugify(title) || `sec-${Date.now()}`
      sectionSlug = baseSlug
      let counter = 1
      while (lesson.sections.some((s) => s.slug === sectionSlug)) {
        sectionSlug = `${baseSlug}-${counter++}`
      }
    }

    const sectionCount = lesson.sections.length
    let targetPosition =
      position && position > 0
        ? position
        : existing
          ? existing.position
          : sectionCount + 1

    let section: SectionRecord
    if (existing) {
      section = await this.prisma.section.update({
        where: { id: existing.id },
        data: {
          title,
          position: targetPosition,
          kind: kind === "EXERCISE" ? "EXERCISE" : "TEXT",
          contentMarkdown: contentMarkdown ?? "",
        },
      })
    } else {
      if (lesson.sections.some((s) => s.position === targetPosition)) {
        targetPosition = sectionCount + 1
      }
      section = await this.prisma.section.create({
        data: {
          lessonId: lesson.id,
          slug: sectionSlug,
          title,
          position: targetPosition,
          kind: kind === "EXERCISE" ? "EXERCISE" : "TEXT",
          contentMarkdown: contentMarkdown ?? "",
        },
      })
    }

    return {
      id: section.id,
      slug: section.slug,
      title: section.title,
      position: section.position,
      kind: section.kind,
      contentMarkdown: section.contentMarkdown,
    }
  }

  async deleteSection(
    sectionId: number,
    requestorCode: string,
    requestorRole: string,
  ) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        lesson: {
          include: {
            track: { include: { creator: { select: { code: true } } } },
          },
        },
      },
    })
    if (!section) return { success: true }

    if (
      requestorRole !== "ADMIN" &&
      section.lesson.track.creator?.code !== requestorCode
    ) {
      throw catalogError("FORBIDDEN")
    }

    await this.prisma.section.delete({ where: { id: sectionId } })
    return { success: true }
  }
}

export { CatalogAdminService as CatalogAdminGatewayService }
