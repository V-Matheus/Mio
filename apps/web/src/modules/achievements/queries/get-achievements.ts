import { getAchievements } from "@/modules/achievements/services"
import type { AchievementsPage } from "@/modules/achievements/types"

export async function getAchievementsQuery(
  limit = 10,
  offset = 0,
): Promise<AchievementsPage> {
  return getAchievements(limit, offset)
}
