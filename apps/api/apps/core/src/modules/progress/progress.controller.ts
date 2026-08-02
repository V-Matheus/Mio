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
}
