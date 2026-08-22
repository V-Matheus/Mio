import { getLeaderboard } from "@/modules/gamification/services"
import type { LeaderboardEntry } from "@/modules/gamification/types"

export async function getLeaderboardQuery(
  limit = 50,
  offset = 0,
): Promise<LeaderboardEntry[]> {
  return getLeaderboard(limit, offset)
}
