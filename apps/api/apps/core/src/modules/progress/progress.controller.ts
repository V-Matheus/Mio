import { progressContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ProgressService } from "./progress.service"

const SERVICE_NAME = progressContract.service

@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @GrpcMethod(SERVICE_NAME, "MarkSectionViewed")
  async markSectionViewed(data: { userCode: string; sectionId: number }) {
    const result = await this.progressService.markSectionViewed(
      data.userCode,
      data.sectionId,
    )
    return {
      ok: result.ok,
      lessonCompleted: result.lessonCompleted,
    }
  }

  @GrpcMethod(SERVICE_NAME, "MarkLessonCompleted")
  async markLessonCompleted(data: { userCode: string; lessonId: number }) {
    const result = await this.progressService.markLessonCompleted(
      data.userCode,
      data.lessonId,
    )
    return {
      ok: result.ok,
      lessonCompleted: result.lessonCompleted,
    }
  }

  @GrpcMethod(SERVICE_NAME, "GetLessonProgress")
  async getLessonProgress(data: { userCode: string; lessonId: number }) {
    const progress = await this.progressService.getLessonProgress(
      data.userCode,
      data.lessonId,
    )
    return {
      lastSectionId: progress.lastSectionId,
      completedAt: progress.completedAt,
      viewedSectionIds: progress.viewedSectionIds,
    }
  }

  @GrpcMethod(SERVICE_NAME, "GetStudentProfileProgress")
  async getStudentProfileProgress(data: { userCode: string }) {
    const result = await this.progressService.getStudentProfileProgress(
      data.userCode,
    )
    return {
      totalCompletedLessons: result.totalCompletedLessons,
      completedTracksCount: result.completedTracksCount,
      inProgressTracks: result.inProgressTracks.map((t) => ({
        trackId: t.trackId,
        trackSlug: t.trackSlug,
        trackTitle: t.trackTitle,
        totalLessons: t.totalLessons,
        completedLessons: t.completedLessons,
        progressPercentage: t.progressPercentage,
        currentLessonSlug: t.currentLessonSlug,
        currentLessonTitle: t.currentLessonTitle,
      })),
      recentActivities: result.recentActivities.map((a) => ({
        lessonId: a.lessonId,
        lessonSlug: a.lessonSlug,
        lessonTitle: a.lessonTitle,
        trackSlug: a.trackSlug,
        trackTitle: a.trackTitle,
        completedAt: a.completedAt,
      })),
    }
  }
}
