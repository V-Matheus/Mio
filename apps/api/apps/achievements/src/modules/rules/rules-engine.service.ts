import type { Prisma } from ".prisma/achievements"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { AchievementEventsPublisher } from "./events/achievement-events.publisher"

export const AchievementRuleType = {
  LESSONS_COMPLETED: "LESSONS_COMPLETED",
  TOTAL_XP: "TOTAL_XP",
  STREAK_DAYS: "STREAK_DAYS",
} as const

export type AchievementRuleType =
  (typeof AchievementRuleType)[keyof typeof AchievementRuleType]

/**
 * Resolve e desbloqueia conquistas dado o valor atual de cada regra (lições
 * concluídas, XP total ou streak). O valor sempre vem da fonte da verdade —
 * Core (`GetStudentProfileProgress`) ou Gamification, nunca de um contador
 * espelhado localmente — então reprocessar o mesmo evento é inofensivo por
 * construção (mesma pergunta, mesma resposta). O desbloqueio em si é
 * idempotente pela inserção em `UserAchievement` respeitar
 * `@@unique([userCode, achievementId])`: reentregas do mesmo evento não
 * duplicam o desbloqueio nem o publish.
 */
@Injectable()
export class RulesEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: AchievementEventsPublisher,
  ) {}

  async evaluateLessonsCompleted(
    userCode: string,
    totalCompletedLessons: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.unlockEligible(
        tx,
        userCode,
        AchievementRuleType.LESSONS_COMPLETED,
        totalCompletedLessons,
      )
    })
  }

  async evaluateTotalXp(userCode: string, totalAfter: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.unlockEligible(
        tx,
        userCode,
        AchievementRuleType.TOTAL_XP,
        totalAfter,
      )
    })
  }

  async evaluateStreakDays(
    userCode: string,
    streakCurrent: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.unlockEligible(
        tx,
        userCode,
        AchievementRuleType.STREAK_DAYS,
        streakCurrent,
      )
    })
  }

  private async unlockEligible(
    tx: Prisma.TransactionClient,
    userCode: string,
    ruleType: AchievementRuleType,
    currentValue: number,
  ): Promise<void> {
    const candidates = await tx.achievement.findMany({
      where: {
        ruleType,
        threshold: { lte: currentValue },
        unlocks: { none: { userCode } },
      },
    })

    for (const achievement of candidates) {
      try {
        await tx.userAchievement.create({
          data: { userCode, achievementId: achievement.id },
        })
      } catch (err) {
        const code = (err as { code?: string }).code
        if (code === "P2002") {
          // Desbloqueada concorrentemente (reentrega do evento) — idempotência ok.
          continue
        }
        throw err
      }

      await this.events.achievementUnlocked(
        {
          userCode,
          achievementSlug: achievement.slug,
          title: achievement.title,
          iconUrl: achievement.iconUrl ?? "",
          unlockedAt: new Date().toISOString(),
          xpReward: achievement.xpReward,
        },
        { client: tx },
      )
    }
  }
}
