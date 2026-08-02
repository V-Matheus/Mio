import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { catalogError } from "./errors/catalog.errors"

export type SectionSummary = {
  id: number
  slug: string
  title: string
  position: number
  kind: string
  completed: boolean
}

export type LessonDetail = {
  id: number
  trackSlug: string
  lessonSlug: string
  title: string
  sections: SectionSummary[]
}

export type SectionDetail = {
  id: number
  slug: string
  title: string
  kind: string
  contentMarkdown: string
}

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLesson(
    trackSlug: string,
    lessonSlug: string,
    userCode?: string,
  ): Promise<LessonDetail> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { slug: lessonSlug, track: { slug: trackSlug } },
      include: { sections: { orderBy: { position: "asc" } } },
    })
    if (!lesson) {
      throw catalogError("LESSON_NOT_FOUND")
    }

    if (!userCode) {
      throw catalogError("FORBIDDEN")
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        user: { code: userCode },
        trackId: lesson.trackId,
      },
    })
    if (!enrollment) {
      throw catalogError("FORBIDDEN")
    }

    let viewedSectionIds = new Set<number>()
    if (lesson.sections.length > 0) {
      const sectionIds = lesson.sections.map((s) => s.id)
      const views = await this.prisma.sectionView.findMany({
        where: {
          user: { code: userCode },
          sectionId: { in: sectionIds },
        },
        select: { sectionId: true },
      })
      viewedSectionIds = new Set(views.map((v) => v.sectionId))
    }

    return {
      id: lesson.id,
      trackSlug,
      lessonSlug: lesson.slug,
      title: lesson.title,
      sections: lesson.sections.map((section) => ({
        id: section.id,
        slug: section.slug,
        title: section.title,
        position: section.position,
        kind: section.kind,
        completed: viewedSectionIds.has(section.id),
      })),
    }
  }

  async getSection(
    trackSlug: string,
    lessonSlug: string,
    sectionSlug: string,
    userCode?: string,
  ): Promise<SectionDetail> {
    const section = await this.prisma.section.findFirst({
      where: {
        slug: sectionSlug,
        lesson: { slug: lessonSlug, track: { slug: trackSlug } },
      },
      include: {
        lesson: { select: { trackId: true } },
      },
    })
    if (!section) {
      throw catalogError("SECTION_NOT_FOUND")
    }

    if (!userCode) {
      throw catalogError("FORBIDDEN")
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        user: { code: userCode },
        trackId: section.lesson.trackId,
      },
    })
    if (!enrollment) {
      throw catalogError("FORBIDDEN")
    }

    return {
      id: section.id,
      slug: section.slug,
      title: section.title,
      kind: section.kind,
      contentMarkdown: section.contentMarkdown,
    }
  }
}
