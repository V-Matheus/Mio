import { Injectable } from "@nestjs/common"
import { GamificationClientService } from "../gamification-client/gamification-client.service"
import { PrismaService } from "../prisma/prisma.service"
import { achievementsError } from "./errors/achievements.errors"

export type AchievementDto = {
  slug: string
  title: string
  description: string
  iconUrl: string
  ruleType: string
  threshold: number
}

export type UserAchievementDto = AchievementDto & {
  unlocked: boolean
  unlockedAt: string
  progress: number
}

export type AchievementsPage = {
  achievements: AchievementDto[]
  total: number
}

export type UserAchievementsPage = {
  entries: UserAchievementDto[]
  total: number
  unlockedTotal: number
}

const LESSONS_COMPLETED_COUNTER = "lessons_completed"

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationClient: GamificationClientService,
  ) {}

  async listAchievements(
    limit: number,
    offset: number,
  ): Promise<AchievementsPage> {
    const [rows, total] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: { threshold: "asc" },
        skip: offset,
        take: limit,
      }),
      this.prisma.achievement.count(),
    ])

    return {
      achievements: rows.map((achievement) => ({
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        iconUrl: achievement.iconUrl ?? "",
        ruleType: achievement.ruleType,
        threshold: achievement.threshold,
      })),
      total,
    }
  }

  async getUserAchievements(
    userCode: string,
    limit: number,
    offset: number,
  ): Promise<UserAchievementsPage> {
    if (!userCode?.trim()) {
      throw achievementsError("INVALID_USER_CODE")
    }

    const [
      pageAchievements,
      total,
      unlockedTotal,
      counter,
      totalXp,
      streakCurrent,
    ] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: { threshold: "asc" },
        skip: offset,
        take: limit,
      }),
      this.prisma.achievement.count(),
      this.prisma.userAchievement.count({ where: { userCode } }),
      this.prisma.userCounter.findUnique({
        where: {
          userCode_counter: {
            userCode,
            counter: LESSONS_COMPLETED_COUNTER,
          },
        },
      }),
      this.gamificationClient.getTotalXp(userCode),
      this.gamificationClient.getStreakCurrent(userCode),
    ])

    const achievementIds = pageAchievements.map((achievement) => achievement.id)
    const unlocks = achievementIds.length
      ? await this.prisma.userAchievement.findMany({
          where: { userCode, achievementId: { in: achievementIds } },
        })
      : []

    const unlockByAchievementId = new Map(
      unlocks.map((unlock) => [unlock.achievementId.toString(), unlock]),
    )

    const currentValueByRuleType: Record<string, number> = {
      LESSONS_COMPLETED: counter?.value ?? 0,
      TOTAL_XP: totalXp,
      STREAK_DAYS: streakCurrent,
    }

    const entries = pageAchievements.map((achievement) => {
      const unlock = unlockByAchievementId.get(achievement.id.toString())
      const currentValue = currentValueByRuleType[achievement.ruleType] ?? 0

      return {
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        iconUrl: achievement.iconUrl ?? "",
        ruleType: achievement.ruleType,
        unlocked: Boolean(unlock),
        unlockedAt: unlock?.unlockedAt.toISOString() ?? "",
        progress: Math.min(currentValue, achievement.threshold),
        threshold: achievement.threshold,
      }
    })

    return { entries, total, unlockedTotal }
  }
}
