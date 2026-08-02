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
  ): Promise<LessonDetail> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { slug: lessonSlug, track: { slug: trackSlug } },
      include: { sections: { orderBy: { position: "asc" } } },
    })
    if (!lesson) {
      throw catalogError("LESSON_NOT_FOUND")
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
        completed: false,
      })),
    }
  }

  async getSection(
    trackSlug: string,
    lessonSlug: string,
    sectionSlug: string,
  ): Promise<SectionDetail> {
    const section = await this.prisma.section.findFirst({
      where: {
        slug: sectionSlug,
        lesson: { slug: lessonSlug, track: { slug: trackSlug } },
      },
    })
    if (!section) {
      throw catalogError("SECTION_NOT_FOUND")
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
