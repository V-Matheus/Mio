import "server-only"

import {
  ACHIEVEMENTS_QUERY,
  MY_ACHIEVEMENTS_QUERY,
} from "@/modules/achievements/graphql"
import type {
  AchievementsPage,
  UserAchievementsPage,
} from "@/modules/achievements/types"
import { gatewayError, getGatewayClient } from "@/shared/gateway/client"

export async function getAchievements(
  limit: number,
  offset: number,
): Promise<AchievementsPage> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(ACHIEVEMENTS_QUERY, { limit, offset })

    return {
      items: (data.achievements?.items ?? []).map((achievement) => ({
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        iconUrl: achievement.iconUrl || null,
        ruleType: achievement.ruleType,
        threshold: achievement.threshold,
      })),
      total: data.achievements?.total ?? 0,
    }
  } catch (error) {
    await gatewayError(error, "Falha ao carregar conquistas disponíveis")
    return { items: [], total: 0 }
  }
}

export async function getMyAchievements(
  limit: number,
  offset: number,
): Promise<UserAchievementsPage> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(MY_ACHIEVEMENTS_QUERY, {
      limit,
      offset,
    })

    return {
      items: (data.myAchievements?.items ?? []).map((entry) => ({
        slug: entry.slug,
        title: entry.title,
        description: entry.description,
        iconUrl: entry.iconUrl || null,
        unlocked: entry.unlocked,
        unlockedAt: entry.unlockedAt || null,
        progress: entry.progress,
        threshold: entry.threshold,
      })),
      total: data.myAchievements?.total ?? 0,
      unlockedTotal: data.myAchievements?.unlockedTotal ?? 0,
    }
  } catch (error) {
    await gatewayError(error, "Falha ao carregar suas conquistas")
    return { items: [], total: 0, unlockedTotal: 0 }
  }
}
