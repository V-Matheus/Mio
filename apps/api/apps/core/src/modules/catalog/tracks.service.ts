import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { catalogError } from "./errors/catalog.errors"

export type Category = {
  id: string
  slug: string
  name: string
  color: string
}

export type TrackSummary = {
  id: number
  slug: string
  title: string
  description: string
  category?: Category | null
  lessonCount: number
  enrolled: boolean
}

export type LessonSummary = {
  id: number
  slug: string
  title: string
  position: number
  completed: boolean
}

export type TrackDetail = {
  id: number
  slug: string
  title: string
  description: string
  category?: Category | null
  lessons: LessonSummary[]
  enrolled: boolean
}

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
    })
    return categories.map((c) => ({
      id: String(c.id),
      slug: c.slug,
      name: c.name,
      color: c.color,
    }))
  }

  /** `userCode` vazio = visitante anônimo: `enrolled` sai sempre false. */
  async listTracks(userCode: string): Promise<TrackSummary[]> {
    const tracks = await this.prisma.track.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        category: true,
        _count: { select: { lessons: true } },
      },
    })
    const enrolledTrackIds = await this.enrolledTrackIds(userCode)

    return tracks.map((track) => ({
      id: track.id,
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      category: track.category
        ? {
            id: String(track.category.id),
            slug: track.category.slug,
            name: track.category.name,
            color: track.category.color,
          }
        : null,
      lessonCount: track._count.lessons,
      enrolled: enrolledTrackIds.has(track.id),
    }))
  }

  async getTrack(slug: string, userCode: string): Promise<TrackDetail> {
    const track = await this.prisma.track.findUnique({
      where: { slug },
      include: {
        category: true,
        lessons: { orderBy: { position: "asc" } },
      },
    })
    if (!track) {
      throw catalogError("TRACK_NOT_FOUND")
    }

    const enrolledTrackIds = await this.enrolledTrackIds(userCode)
    const completedLessonIds = await this.completedLessonIds(
      userCode,
      track.lessons.map((lesson) => lesson.id),
    )

    return {
      id: track.id,
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      category: track.category
        ? {
            id: String(track.category.id),
            slug: track.category.slug,
            name: track.category.name,
            color: track.category.color,
          }
        : null,
      lessons: track.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        position: lesson.position,
        completed: completedLessonIds.has(lesson.id),
      })),
      enrolled: enrolledTrackIds.has(track.id),
    }
  }

  private async enrolledTrackIds(userCode: string): Promise<Set<number>> {
    if (!userCode) {
      return new Set()
    }
    const enrollments = await this.prisma.enrollment.findMany({
      where: { user: { code: userCode } },
      select: { trackId: true },
    })
    return new Set(enrollments.map((enrollment) => enrollment.trackId))
  }

  private async completedLessonIds(
    userCode: string,
    lessonIds: number[],
  ): Promise<Set<number>> {
    if (!userCode || lessonIds.length === 0) {
      return new Set()
    }
    const progress = await this.prisma.lessonProgress.findMany({
      where: {
        user: { code: userCode },
        lessonId: { in: lessonIds },
        completedAt: { not: null },
      },
      select: { lessonId: true },
    })
    return new Set(progress.map((entry) => entry.lessonId))
  }
}
