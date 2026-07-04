import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { catalogError } from "./errors/catalog.errors"

export type TrackSummary = {
  slug: string
  title: string
  description: string
  lessonCount: number
  enrolled: boolean
}

export type LessonSummary = {
  slug: string
  title: string
  position: number
  completed: boolean
}

export type TrackDetail = {
  slug: string
  title: string
  description: string
  lessons: LessonSummary[]
  enrolled: boolean
}

@Injectable()
export class TracksService {
  constructor(private readonly prisma: PrismaService) {}

  /** `userCode` vazio = visitante anônimo: `enrolled` sai sempre false. */
  async listTracks(userCode: string): Promise<TrackSummary[]> {
    const tracks = await this.prisma.track.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { lessons: true } } },
    })
    const enrolledTrackIds = await this.enrolledTrackIds(userCode)

    return tracks.map((track) => ({
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      lessonCount: track._count.lessons,
      enrolled: enrolledTrackIds.has(track.id),
    }))
  }

  async getTrack(slug: string, userCode: string): Promise<TrackDetail> {
    const track = await this.prisma.track.findUnique({
      where: { slug },
      include: { lessons: { orderBy: { position: "asc" } } },
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
      slug: track.slug,
      title: track.title,
      description: track.description ?? "",
      lessons: track.lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        position: lesson.position,
        completed: completedLessonIds.has(lesson.id),
      })),
      enrolled: enrolledTrackIds.has(track.id),
    }
  }

  private async enrolledTrackIds(userCode: string): Promise<Set<bigint>> {
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
    lessonIds: bigint[],
  ): Promise<Set<bigint>> {
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
