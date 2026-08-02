import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { progressError } from "./errors/progress.errors"
import { ProgressEventsPublisher } from "./events/progress-events.publisher"

export type ProgressResult = {
  ok: boolean
  lessonCompleted: boolean
}

export type LessonProgressDetail = {
  lastSectionId: number | null
  completedAt: string
  viewedSectionIds: number[]
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: ProgressEventsPublisher,
  ) {}

  async markSectionViewed(
    userCode: string,
    sectionId: number,
  ): Promise<ProgressResult> {
    const user = await this.prisma.user.findUnique({
      where: { code: userCode },
    })
    if (!user) {
      throw progressError("USER_NOT_FOUND")
    }

    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        lesson: {
          include: {
            track: true,
            sections: true,
          },
        },
      },
    })
    if (!section) {
      throw progressError("SECTION_NOT_FOUND")
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Marca visualização da seção
      await tx.sectionView.upsert({
        where: {
          userId_sectionId: {
            userId: user.id,
            sectionId: section.id,
          },
        },
        create: {
          userId: user.id,
          sectionId: section.id,
        },
        update: {},
      })

      // 2. Atualiza última seção vista no progresso da lição
      const existingProgress = await tx.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: section.lessonId,
          },
        },
      })

      if (existingProgress) {
        await tx.lessonProgress.update({
          where: { id: existingProgress.id },
          data: { lastSectionId: section.id },
        })
      } else {
        await tx.lessonProgress.create({
          data: {
            userId: user.id,
            lessonId: section.lessonId,
            lastSectionId: section.id,
          },
        })
      }

      // 3. Checa se todas as seções da lição já foram vistas
      const allSectionIds = section.lesson.sections.map((s) => s.id)
      const viewedCount = await tx.sectionView.count({
        where: {
          userId: user.id,
          sectionId: { in: allSectionIds },
        },
      })

      const allViewed = viewedCount >= allSectionIds.length
      let newlyCompleted = false

      if (allViewed && !existingProgress?.completedAt) {
        const completedAt = new Date()

        await tx.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId: user.id,
              lessonId: section.lessonId,
            },
          },
          update: { completedAt },
          create: {
            userId: user.id,
            lessonId: section.lessonId,
            lastSectionId: section.id,
            completedAt,
          },
        })

        await this.events.lessonCompleted(
          {
            userCode: user.code,
            trackSlug: section.lesson.track.slug,
            lessonSlug: section.lesson.slug,
            lessonId: String(section.lessonId),
            trackId: String(section.lesson.trackId),
            completedAt: completedAt.toISOString(),
          },
          { client: tx },
        )

        newlyCompleted = true
      }

      return {
        ok: true,
        lessonCompleted: newlyCompleted,
      }
    })
  }

  async markLessonCompleted(
    userCode: string,
    lessonId: number,
  ): Promise<ProgressResult> {
    const user = await this.prisma.user.findUnique({
      where: { code: userCode },
    })
    if (!user) {
      throw progressError("USER_NOT_FOUND")
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { track: true },
    })
    if (!lesson) {
      throw progressError("LESSON_NOT_FOUND")
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lesson.id,
          },
        },
      })

      if (existing?.completedAt) {
        return { ok: true, lessonCompleted: false }
      }

      const completedAt = new Date()

      await tx.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lesson.id,
          },
        },
        update: { completedAt },
        create: {
          userId: user.id,
          lessonId: lesson.id,
          completedAt,
        },
      })

      await this.events.lessonCompleted(
        {
          userCode: user.code,
          trackSlug: lesson.track.slug,
          lessonSlug: lesson.slug,
          lessonId: String(lesson.id),
          trackId: String(lesson.trackId),
          completedAt: completedAt.toISOString(),
        },
        { client: tx },
      )

      return { ok: true, lessonCompleted: true }
    })
  }

  async getLessonProgress(
    userCode: string,
    lessonId: number,
  ): Promise<LessonProgressDetail> {
    const user = await this.prisma.user.findUnique({
      where: { code: userCode },
    })
    if (!user) {
      return { lastSectionId: null, completedAt: "", viewedSectionIds: [] }
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        sections: { select: { id: true } },
      },
    })
    if (!lesson) {
      return { lastSectionId: null, completedAt: "", viewedSectionIds: [] }
    }

    const progress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lesson.id,
        },
      },
    })

    const sectionIds = lesson.sections.map((s) => s.id)
    const sectionViews = await this.prisma.sectionView.findMany({
      where: {
        userId: user.id,
        sectionId: { in: sectionIds },
      },
      select: { sectionId: true },
    })

    return {
      lastSectionId: progress?.lastSectionId ?? null,
      completedAt: progress?.completedAt
        ? progress.completedAt.toISOString()
        : "",
      viewedSectionIds: sectionViews.map((sv) => sv.sectionId),
    }
  }
}
