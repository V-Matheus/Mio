import { RedisService } from "@mio/redis"
import { Injectable, type OnModuleInit } from "@nestjs/common"
import { CoreClientService } from "../core-client/core-client.service"
import { PrismaService } from "../prisma/prisma.service"
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
export class LeaderboardService implements OnModuleInit {
  constructor(
    private readonly redis: RedisService,
    private readonly coreClient: CoreClientService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Na inicialização do módulo, sincroniza o ranking a partir do Postgres/seeds se necessário.
   */
  async onModuleInit(): Promise<void> {
    try {
      const count = await this.redis.zcard(LEADERBOARD_KEY)
      const dbCount = await this.prisma.userXp
        .count({ where: { total: { gt: 0 } } })
        .catch(() => 0)

      if (count !== dbCount) {
        await this.rebuildFromDatabase()
      }
    } catch {
      // Falha defensiva caso o Redis ainda esteja conectando
    }
  }

  /**
   * Reconstrói o Sorted Set do Redis a partir dos registros de UserXp no Postgres.
   * Escreve os dados em uma chave temporária e substitui atomicamente a chave global.
   */
  async rebuildFromDatabase(): Promise<number> {
    try {
      const users = await this.prisma.userXp.findMany({
        where: { total: { gt: 0 } },
      })

      if (users.length === 0) {
        await this.redis.del(LEADERBOARD_KEY)
        return 0
      }

      const tmpKey = `${LEADERBOARD_KEY}:tmp:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`

      try {
        for (const u of users) {
          const lastTx = await this.prisma.xpTransaction.findFirst({
            where: { userCode: u.userCode },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          })
          const timestamp = lastTx?.createdAt
            ? new Date(lastTx.createdAt).getTime()
            : Date.now()
          const compositeScore = calculateCompositeScore(u.total, timestamp)
          await this.redis.zadd(tmpKey, compositeScore, u.userCode)
        }

        await this.redis.rename(tmpKey, LEADERBOARD_KEY)
      } catch (err) {
        await this.redis.del(tmpKey).catch(() => {})
        throw err
      }

      return users.length
    } catch {
      return 0
    }
  }

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
   * Se o usuário não for encontrado no Redis mas possuir XP positivo no Postgres,
   * reconstrói o ranking a partir do Postgres e tenta novamente.
   */
  async getUserRank(userCode: string): Promise<number> {
    let rank = await this.redis.zrevrank1Based(LEADERBOARD_KEY, userCode)

    if (rank === 0) {
      try {
        const userXp = await this.prisma.userXp
          .findUnique({
            where: { userCode },
            select: { total: true },
          })
          .catch(() => null)

        if (userXp && userXp.total > 0) {
          await this.rebuildFromDatabase()
          rank = await this.redis.zrevrank1Based(LEADERBOARD_KEY, userCode)
        }
      } catch {
        // Retorna 0 defensivamente
      }
    }

    return rank
  }

  /**
   * Consulta a lista do ranking paginado no Redis e enriquece com dados cadastrais do Core em lote.
   */
  async getLeaderboard(limit = 50, offset = 0): Promise<LeaderboardResultDto> {
    const safeLimit = Math.max(1, Math.min(limit, 100))
    const safeOffset = Math.max(0, offset)
    const stop = safeOffset + safeLimit - 1

    let [rangeItems, totalUsers] = await Promise.all([
      this.redis.zrevrangeWithScores(LEADERBOARD_KEY, safeOffset, stop),
      this.redis.zcard(LEADERBOARD_KEY),
    ])

    const dbCount = await this.prisma.userXp
      .count({ where: { total: { gt: 0 } } })
      .catch(() => 0)

    // Auto-rebuild se Redis estiver vazio ou as contagens divergirem em qualquer direção
    if (
      (rangeItems.length === 0 && safeOffset === 0 && dbCount > 0) ||
      totalUsers !== dbCount
    ) {
      const rebuiltCount = await this.rebuildFromDatabase()
      if (rebuiltCount > 0 || (rebuiltCount === 0 && dbCount === 0)) {
        ;[rangeItems, totalUsers] = await Promise.all([
          this.redis.zrevrangeWithScores(LEADERBOARD_KEY, safeOffset, stop),
          this.redis.zcard(LEADERBOARD_KEY),
        ])
      }
    }

    if (rangeItems.length === 0) {
      return { entries: [], totalUsers }
    }

    const userCodes = rangeItems.map((item) => item.member)
    const usersData = await this.coreClient.batchGetUsers(userCodes)
    const usersMap = new Map(
      usersData.map((u) => [
        u.code,
        {
          name: u.name,
          avatarUrl: u.avatarUrl,
        },
      ]),
    )

    const entries: LeaderboardEntryDto[] = rangeItems.map((item, idx) => {
      const coreUser = usersMap.get(item.member)
      const exactXp = extractXpFromScore(item.score)
      const levelProg = levelFor(exactXp)
      return {
        userCode: item.member,
        name: coreUser?.name ?? "Aluno",
        avatarUrl: coreUser?.avatarUrl ?? "",
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
