import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { GraphQLError } from "graphql"
import { firstValueFrom, type Observable } from "rxjs"
import { PROGRESS_PACKAGE_TOKEN } from "../../grpc/registry"
import type { LessonProgress, MarkSectionResult } from "./dto/progress.dto"
import type { ProgressServiceClient } from "./repositories/progress.repository"

@Injectable()
export class ProgressGatewayService implements OnModuleInit {
  private progressService!: ProgressServiceClient

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
    const res = await this.call(
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
    const res = await this.call(
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
    const res = await this.call(
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

  private async call<T>(source: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(source)
    } catch (error) {
      const details = (error as { details?: string })?.details
      throw new GraphQLError(details ?? "Erro ao processar progresso", {
        extensions: { code: "PROGRESS_ERROR" },
      })
    }
  }
}
