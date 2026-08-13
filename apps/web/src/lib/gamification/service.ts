import "server-only"

import { gatewayError, getGatewayClient } from "@/lib/gateway/client"
import { LEADERBOARD_QUERY, MY_XP_QUERY } from "./graphql"
import type { LeaderboardEntry, UserXp } from "./types"

export async function getMyXp(): Promise<UserXp | null> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(MY_XP_QUERY)
    if (!data.myXp) return null

    return {
      total: data.myXp.total,
      level: data.myXp.level,
      progressToNext: data.myXp.progressToNext,
      xpToNextLevel: data.myXp.xpToNextLevel,
      rank: data.myXp.rank,
    }
  } catch (error) {
    await gatewayError(error, "Falha ao carregar pontuação de XP do usuário")
    return null
  }
}

export async function getLeaderboard(
  limit = 50,
  offset = 0,
): Promise<LeaderboardEntry[]> {
  try {
    const client = await getGatewayClient()
    const data = await client.request(LEADERBOARD_QUERY, { limit, offset })

    return (data.leaderboard ?? []).map((entry) => ({
      userCode: entry.userCode,
      name: entry.name,
      avatarUrl: entry.avatarUrl ?? null,
      total: entry.total,
      rank: entry.rank,
      level: entry.level,
    }))
  } catch (error) {
    await gatewayError(error, "Falha ao carregar ranking global")
    return []
  }
}
