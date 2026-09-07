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

const LESSONS_COMPLETED_COUNTER = "lessons_completed"

/**
 * Resolve e desbloqueia conquistas dado o valor atual de um contador
 * (lições concluídas ou XP total). Idempotente por construção: a inserção
 * em `UserAchievement` respeita `@@unique([userCode, achievementId])`, então
 * reentregas do mesmo evento não duplicam o desbloqueio nem o publish.
 */
@Injectable()
export class RulesEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: AchievementEventsPublisher,
  ) {}

  async evaluateLessonsCompleted(userCode: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const counter = await tx.userCounter.upsert({
        where: {
          userCode_counter: { userCode, counter: LESSONS_COMPLETED_COUNTER },
        },
        create: { userCode, counter: LESSONS_COMPLETED_COUNTER, value: 1 },
        update: { value: { increment: 1 } },
      })

      await this.unlockEligible(
        tx,
        userCode,
        AchievementRuleType.LESSONS_COMPLETED,
        counter.value,
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
