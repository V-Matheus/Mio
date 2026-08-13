import { getLeaderboard } from "@/lib/gamification/service"
import type { LeaderboardEntry } from "@/lib/gamification/types"

export async function getLeaderboardQuery(
  limit = 50,
  offset = 0,
): Promise<LeaderboardEntry[]> {
  return getLeaderboard(limit, offset)
}
