import { RedisService } from "@mio/redis"
import { Injectable } from "@nestjs/common"
import { CoreClientService } from "../core-client/core-client.service"
import { levelFor } from "../xp/level"

export const LEADERBOARD_KEY = "mio:xp:global"

/**
 * Calcula o score composto para o Sorted Set do Redis.
 * A parte inteira é o XP total acumulado (critério primário).
 * A parte fracionária é o desempate por tempo (quem alcançou a pontuação primeiro tem maior fração).
 * Timestamp de 13 dígitos normalizado para 0 < fração < 1.
 */
export function calculateCompositeScore(
  totalXp: number,
  timestamp = Date.now(),
): number {
  if (totalXp <= 0) return 0
  const fraction = Math.max(
    0,
    Math.min(0.99999999, 1 - timestamp / 10_000_000_000_000),
  )
  return totalXp + fraction
}

/**
 * Extrai o valor inteiro de XP a partir do score composto do Redis.
 */
export function extractXpFromScore(score: number): number {
  return Math.floor(score)
}

export interface LeaderboardEntryDto {
  userCode: string
  name: string
  avatarUrl: string
  total: number
  rank: number
  level: string
}

export interface LeaderboardResultDto {
  entries: LeaderboardEntryDto[]
  totalUsers: number
}

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly redis: RedisService,
    private readonly coreClient: CoreClientService,
  ) {}

  /**
   * Atualiza a pontuação de XP do usuário no Sorted Set do Redis com desempate por tempo.
   */
  async updateScore(
    userCode: string,
    totalXp: number,
    timestamp = Date.now(),
  ): Promise<void> {
    const compositeScore = calculateCompositeScore(totalXp, timestamp)
    await this.redis.zaddGreater(LEADERBOARD_KEY, compositeScore, userCode)
  }

  /**
   * Retorna a posição (rank 1-based) do usuário no ranking global.
   * Retorna 0 se o usuário não constar no ranking.
   */
  async getUserRank(userCode: string): Promise<number> {
    return await this.redis.zrevrank1Based(LEADERBOARD_KEY, userCode)
  }

  /**
   * Consulta a lista do ranking paginado no Redis e enriquece com dados cadastrais do Core em lote.
   */
  async getLeaderboard(limit = 50, offset = 0): Promise<LeaderboardResultDto> {
    const safeLimit = Math.max(1, Math.min(limit, 100))
    const safeOffset = Math.max(0, offset)
    const stop = safeOffset + safeLimit - 1

    const [rangeItems, totalUsers] = await Promise.all([
      this.redis.zrevrangeWithScores(LEADERBOARD_KEY, safeOffset, stop),
      this.redis.zcard(LEADERBOARD_KEY),
    ])

    if (rangeItems.length === 0) {
      return { entries: [], totalUsers }
    }

    const userCodes = rangeItems.map((item) => item.member)
    const usersData = await this.coreClient.batchGetUsers(userCodes)
    const usersMap = new Map(usersData.map((u) => [u.code, u]))

    const entries: LeaderboardEntryDto[] = rangeItems.map((item, idx) => {
      const user = usersMap.get(item.member)
      const exactXp = extractXpFromScore(item.score)
      const levelProg = levelFor(exactXp)
      return {
        userCode: item.member,
        name: user?.name ?? "Aluno Anônimo",
        avatarUrl: user?.avatar_url ?? "",
        total: exactXp,
        rank: safeOffset + idx + 1,
        level: levelProg.level,
      }
    })

    return {
      entries,
      totalUsers,
    }
  }
}
