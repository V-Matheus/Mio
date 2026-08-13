import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { GrpcCaller } from "../../grpc/grpc-caller"
import { GAMIFICATION_PACKAGE_TOKEN } from "../../grpc/registry"
import { type LeaderboardEntry, Level, type UserXp } from "./gamification.types"
import type { GamificationServiceClient } from "./repositories/gamification.repository"

const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "Usuário não encontrado",
  INVALID_XP_RULE: "Regra de XP inválida",
  LEADERBOARD_UNAVAILABLE: "Ranking indisponível no momento",
}

@Injectable()
export class GamificationGatewayService implements OnModuleInit {
  private gamificationService!: GamificationServiceClient
  private readonly caller = new GrpcCaller({
    serviceEnvVar: "GAMIFICATION_GRPC_TIMEOUT_MS",
    errorMap: ERROR_MESSAGES,
    defaultErrorMessage: "Erro ao consultar gamificação",
    timeoutCode: "LEADERBOARD_UNAVAILABLE",
    timeoutMessage: "Ranking indisponível no momento (tempo limite excedido)",
  })

  constructor(
    @Inject(GAMIFICATION_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.gamificationService =
      this.client.getService<GamificationServiceClient>("GamificationService")
  }

  async getUserXp(userCode: string): Promise<UserXp> {
    const res = await this.caller.call(
      this.gamificationService.getUserXp({ userCode }),
    )

    const levelKey = res.level.toUpperCase() as keyof typeof Level
    const levelEnum = Level[levelKey] ?? Level.LEIGO

    return {
      total: res.total,
      level: levelEnum,
      progressToNext: res.progressToNext,
      xpToNextLevel: res.xpToNextLevel,
      rank: res.rank,
    }
  }

  async getLeaderboard(limit = 50, offset = 0): Promise<LeaderboardEntry[]> {
    const res = await this.caller.call(
      this.gamificationService.getLeaderboard({
        limit,
        offset,
      }),
    )

    return res.entries.map((entry) => ({
      userCode: entry.userCode,
      name: entry.name,
      avatarUrl: entry.avatarUrl || null,
      total: entry.total,
      rank: entry.rank,
      level: entry.level,
    }))
  }
}
