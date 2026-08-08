import { Injectable } from "@nestjs/common"
import { LeaderboardService } from "../leaderboard/leaderboard.service"
import { PrismaService } from "../prisma/prisma.service"
import { XpEventsPublisher } from "./events/xp-events.publisher"
import { levelFor } from "./level"
import { XpRuleKey, XpRulesService } from "./rules/xp-rules.service"

export type UserXpDetail = {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
}

@Injectable()
export class XpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboard: LeaderboardService,
    private readonly events: XpEventsPublisher,
    private readonly rules: XpRulesService,
  ) {}

  /**
   * Credita XP pela conclusão de lição de forma estritamente idempotente.
   */
  async rewardLessonCompleted(
    userCode: string,
    lessonId: string | number,
  ): Promise<{ total: number; newlyAwarded: boolean }> {
    const sourceId = `lesson:${lessonId}`
    const rewardAmount = await this.rules.getAmount(XpRuleKey.LESSON_COMPLETED)

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Checa se essa recompensa já foi atribuída (idempotência)
      const existing = await tx.xpTransaction.findUnique({
        where: {
          userCode_sourceId: {
            userCode,
            sourceId,
          },
        },
      })

      if (existing) {
        const user = await tx.userXp.findUnique({ where: { userCode } })
        return { total: user?.total ?? 0, newlyAwarded: false }
      }

      // 2. Insere a transação de XP
      await tx.xpTransaction.create({
        data: {
          userCode,
          amount: rewardAmount,
          reason: "lesson.completed",
          sourceId,
        },
      })

      // 3. Incrementa ou cria o registro do usuário
      const userXp = await tx.userXp.upsert({
        where: { userCode },
        create: {
          userCode,
          total: rewardAmount,
        },
        update: {
          total: { increment: rewardAmount },
        },
      })

      // 4. Publica o evento xp.rewarded na mesma transação
      const levelInfo = levelFor(userXp.total)
      await this.events.xpRewarded(
        {
          userCode,
          amount: rewardAmount,
          reason: "lesson.completed",
          sourceId,
          totalAfter: userXp.total,
          level: levelInfo.level,
          awardedAt: new Date().toISOString(),
        },
        { client: tx },
      )

      return { total: userXp.total, newlyAwarded: true }
    })

    // Atualiza o Sorted Set no Redis fora da transação
    if (result.newlyAwarded) {
      await this.leaderboard.updateScore(userCode, result.total)
    }

    return result
  }

  /**
   * Consulta o XP total, nível computado e posição no ranking de um usuário.
   */
  async getUserXp(userCode: string): Promise<UserXpDetail> {
    const user = await this.prisma.userXp.findUnique({
      where: { userCode },
    })

    const total = user?.total ?? 0
    const levelInfo = levelFor(total)
    const rank = await this.leaderboard.getUserRank(userCode)

    return {
      total,
      level: levelInfo.level,
      progressToNext: levelInfo.progressToNext,
      xpToNextLevel: levelInfo.xpToNextLevel,
      rank,
    }
  }
}
