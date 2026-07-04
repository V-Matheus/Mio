import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { catalogError } from "./errors/catalog.errors"

export type SectionSummary = {
  slug: string
  title: string
  position: number
  kind: string
  completed: boolean
}

export type LessonDetail = {
  trackSlug: string
  lessonSlug: string
  title: string
  sections: SectionSummary[]
}

export type SectionDetail = {
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
      trackSlug,
      lessonSlug: lesson.slug,
      title: lesson.title,
      sections: lesson.sections.map((section) => ({
        slug: section.slug,
        title: section.title,
        position: section.position,
        kind: section.kind,
        // Conclusão por seção depende de viewedSections (spec 03-progress).
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
      slug: section.slug,
      title: section.title,
      kind: section.kind,
      contentMarkdown: section.contentMarkdown,
    }
  }
}
