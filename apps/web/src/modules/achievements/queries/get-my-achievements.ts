import { getMyAchievements } from "@/modules/achievements/services"
import type { UserAchievementsPage } from "@/modules/achievements/types"

export async function getMyAchievementsQuery(
  limit = 10,
  offset = 0,
): Promise<UserAchievementsPage> {
  return getMyAchievements(limit, offset)
}
