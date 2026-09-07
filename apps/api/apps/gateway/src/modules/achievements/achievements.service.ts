import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { GrpcCaller } from "../../grpc/grpc-caller"
import { ACHIEVEMENTS_PACKAGE_TOKEN } from "../../grpc/registry"
import type {
  AchievementsPage,
  UserAchievementsPage,
} from "./achievements.types"
import type { AchievementsServiceClient } from "./repositories/achievements.repository"

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_USER_CODE: "Código de usuário inválido",
}

@Injectable()
export class AchievementsGatewayService implements OnModuleInit {
  private achievementsService!: AchievementsServiceClient
  private readonly caller = new GrpcCaller({
    serviceEnvVar: "ACHIEVEMENTS_GRPC_TIMEOUT_MS",
    errorMap: ERROR_MESSAGES,
    defaultErrorMessage: "Erro ao consultar conquistas",
    timeoutCode: "UNAVAILABLE",
    timeoutMessage:
      "Conquistas indisponíveis no momento (tempo limite excedido)",
  })

  constructor(
    @Inject(ACHIEVEMENTS_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.achievementsService =
      this.client.getService<AchievementsServiceClient>("AchievementsService")
  }

  async listAchievements(
    limit: number,
    offset: number,
  ): Promise<AchievementsPage> {
    const res = await this.caller.call(
      this.achievementsService.listAchievements({ limit, offset }),
    )

    return {
      items: res.achievements.map((achievement) => ({
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        iconUrl: achievement.iconUrl || null,
        ruleType: achievement.ruleType,
        threshold: achievement.threshold,
      })),
      total: res.total,
    }
  }

  async getUserAchievements(
    userCode: string,
    limit: number,
    offset: number,
  ): Promise<UserAchievementsPage> {
    const res = await this.caller.call(
      this.achievementsService.getUserAchievements({
        userCode,
        limit,
        offset,
      }),
    )

    return {
      items: res.entries.map((entry) => ({
        slug: entry.slug,
        title: entry.title,
        description: entry.description,
        iconUrl: entry.iconUrl || null,
        unlocked: entry.unlocked,
        unlockedAt: entry.unlockedAt || null,
        progress: entry.progress,
        threshold: entry.threshold,
      })),
      total: res.total,
      unlockedTotal: res.unlockedTotal,
    }
  }
}
