import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { GraphQLError } from "graphql"
import { firstValueFrom, type Observable } from "rxjs"
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

  constructor(
    @Inject(GAMIFICATION_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.gamificationService =
      this.client.getService<GamificationServiceClient>("GamificationService")
  }

  async getUserXp(userCode: string): Promise<UserXp> {
    const res = await this.call(
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
    const res = await this.call(
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

  private async call<T>(source: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(source)
    } catch (error) {
      throw mapGrpcError(error)
    }
  }
}

function mapGrpcError(error: unknown): GraphQLError {
  const details = (error as { details?: string })?.details
  const code = details && details in ERROR_MESSAGES ? details : "INTERNAL_ERROR"
  return new GraphQLError(
    ERROR_MESSAGES[code] ?? "Erro ao consultar gamificação",
    {
      extensions: { code },
    },
  )
}
