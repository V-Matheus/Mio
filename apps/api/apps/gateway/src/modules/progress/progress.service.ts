import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { GrpcCaller } from "../../grpc/grpc-caller"
import { PROGRESS_PACKAGE_TOKEN } from "../../grpc/registry"
import type { LessonProgress, MarkSectionResult } from "./dto/progress.dto"
import type { ProgressServiceClient } from "./repositories/progress.repository"

@Injectable()
export class ProgressGatewayService implements OnModuleInit {
  private progressService!: ProgressServiceClient
  private readonly caller = new GrpcCaller({
    serviceEnvVar: "PROGRESS_GRPC_TIMEOUT_MS",
    defaultErrorCode: "PROGRESS_ERROR",
    defaultErrorMessage: "Erro ao processar progresso",
    timeoutCode: "PROGRESS_ERROR",
    timeoutMessage: "Serviço de progresso indisponível (tempo limite excedido)",
  })

  constructor(
    @Inject(PROGRESS_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.progressService =
      this.client.getService<ProgressServiceClient>("ProgressService")
  }

  async markSectionViewed(
    userCode: string,
    sectionId: number,
  ): Promise<MarkSectionResult> {
    const res = await this.caller.call(
      this.progressService.markSectionViewed({
        userCode,
        sectionId,
      }),
    )
    return {
      ok: res.ok ?? true,
      lessonCompleted: res.lessonCompleted ?? false,
    }
  }

  async markLessonCompleted(
    userCode: string,
    lessonId: number,
  ): Promise<boolean> {
    const res = await this.caller.call(
      this.progressService.markLessonCompleted({
        userCode,
        lessonId,
      }),
    )
    return res.ok ?? true
  }

  async getLessonProgress(
    userCode: string,
    lessonId: number,
  ): Promise<LessonProgress> {
    const res = await this.caller.call(
      this.progressService.getLessonProgress({
        userCode,
        lessonId,
      }),
    )
    return {
      lastSectionId: res.lastSectionId ?? undefined,
      completedAt: res.completedAt || undefined,
      viewedSectionIds: res.viewedSectionIds ?? [],
    }
  }

  async getStudentProfileProgress(userCode: string) {
    const res = await this.caller.call(
      this.progressService.getStudentProfileProgress({ userCode }),
    )
    return {
      stats: {
        totalCompletedLessons: res.totalCompletedLessons ?? 0,
        completedTracksCount: res.completedTracksCount ?? 0,
      },
      inProgressTracks: (res.inProgressTracks ?? []).map((t) => ({
        trackId: t.trackId,
        trackSlug: t.trackSlug,
        trackTitle: t.trackTitle,
        totalLessons: t.totalLessons,
        completedLessons: t.completedLessons,
        progressPercentage: t.progressPercentage,
        currentLessonSlug: t.currentLessonSlug || null,
        currentLessonTitle: t.currentLessonTitle || null,
      })),
      recentActivities: (res.recentActivities ?? []).map((a) => ({
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
