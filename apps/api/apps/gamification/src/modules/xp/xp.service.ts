import { Injectable } from "@nestjs/common"
import { LeaderboardService } from "../leaderboard/leaderboard.service"
import { PrismaService } from "../prisma/prisma.service"
import { gamificationError } from "./errors/gamification.errors"
import { XpEventsPublisher } from "./events/xp-events.publisher"
import { levelFor } from "./level"
import { XpRuleKey, XpRulesService } from "./rules/xp-rules.service"
import {
  calculateNextStreak,
  type EffectiveStreak,
  getEffectiveStreak,
} from "./streak"

export type UserXpDetail = {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
}

export type WeeklyXpSummary = {
  days: Array<{
    day: string
    date: string
    xp: number
  }>
  totalWeeklyXp: number
}

export type GamificationProfileDetail = UserXpDetail & {
  streak: EffectiveStreak
  weeklyXp: WeeklyXpSummary
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
   * Credita XP pela conclusão de lição de forma estritamente idempotente
   * e atualiza o streak de dias consecutivos do aluno.
   */
  async rewardLessonCompleted(
    userCode: string,
    lessonId: string | number,
  ): Promise<{ total: number; newlyAwarded: boolean }> {
    if (!userCode?.trim()) {
      throw gamificationError("USER_NOT_FOUND")
    }

    const sourceId = `lesson:${lessonId}`
    const rewardAmount = await this.rules.getAmount(XpRuleKey.LESSON_COMPLETED)
    const now = new Date()

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

      // 2. Incrementa ou cria o registro do usuário
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

      // 3. Insere a transação de XP vinculada ao UserXp existente
      await tx.xpTransaction.create({
        data: {
          userCode,
          amount: rewardAmount,
          reason: "lesson.completed",
          sourceId,
          createdAt: now,
        },
      })

      // 4. Atualiza o streak do aluno
      const currentStreakRecord = await tx.userStreak.findUnique({
        where: { userCode },
      })
      const nextStreak = calculateNextStreak(currentStreakRecord, now)

      await tx.userStreak.upsert({
        where: { userCode },
        create: {
          userCode,
          streakCurrent: nextStreak.streakCurrent,
          streakBest: nextStreak.streakBest,
          lastStudyDate: nextStreak.lastStudyDate,
        },
        update: {
          streakCurrent: nextStreak.streakCurrent,
          streakBest: nextStreak.streakBest,
          lastStudyDate: nextStreak.lastStudyDate,
        },
      })

      // 5. Publica o evento xp.rewarded na mesma transação
      const levelInfo = levelFor(userXp.total)
      await this.events.xpRewarded(
        {
          userCode,
          amount: rewardAmount,
          reason: "lesson.completed",
          sourceId,
          totalAfter: userXp.total,
          level: levelInfo.level,
          awardedAt: now.toISOString(),
        },
        { client: tx },
      )

      return { total: userXp.total, newlyAwarded: true }
    })

    // Atualiza/repara o Sorted Set no Redis fora da transação
    if (result.total > 0) {
      await this.leaderboard.updateScore(userCode, result.total)
    }

    return result
  }

  /**
   * Consulta o XP total, nível computado e posição no ranking de um usuário.
   */
  async getUserXp(userCode: string): Promise<UserXpDetail> {
    if (!userCode?.trim()) {
      throw gamificationError("USER_NOT_FOUND")
    }

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

  /**
   * Consulta o histórico de XP da semana corrente (Segunda a Domingo) em UTC.
   */
  async getWeeklyXp(
    userCode: string,
    now: Date = new Date(),
  ): Promise<WeeklyXpSummary> {
    const dayOfWeek = now.getUTCDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const mondayUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + diffToMonday,
        0,
        0,
        0,
        0,
      ),
    )

    const sundayUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + diffToMonday + 6,
        23,
        59,
        59,
        999,
      ),
    )

    const transactions = await this.prisma.xpTransaction.findMany({
      where: {
        userCode,
        createdAt: {
          gte: mondayUtc,
          lte: sundayUtc,
        },
      },
    })

    const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    const days = dayLabels.map((day, index) => {
      const dayDate = new Date(
        Date.UTC(
          mondayUtc.getUTCFullYear(),
          mondayUtc.getUTCMonth(),
          mondayUtc.getUTCDate() + index,
        ),
      )
      const dateString = dayDate.toISOString().slice(0, 10)

      const xp = transactions
        .filter((t) => t.createdAt.toISOString().slice(0, 10) === dateString)
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        day,
        date: dateString,
        xp,
      }
    })

    const totalWeeklyXp = days.reduce((sum, d) => sum + d.xp, 0)

    return {
      days,
      totalWeeklyXp,
    }
  }

  /**
   * Consulta o perfil consolidado de gamificação (XP, nível, ranking, streak e atividade semanal).
   */
  async getUserGamificationProfile(
    userCode: string,
  ): Promise<GamificationProfileDetail> {
    const [xpDetail, streakRecord, weeklyXp] = await Promise.all([
      this.getUserXp(userCode),
      this.prisma.userStreak.findUnique({ where: { userCode } }),
      this.getWeeklyXp(userCode),
    ])

    const streak = getEffectiveStreak(streakRecord)

    return {
      ...xpDetail,
      streak,
      weeklyXp,
    }
  }
}
