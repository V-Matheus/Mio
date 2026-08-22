import { getMyXp } from "@/modules/gamification/services"
import type { UserXp } from "@/modules/gamification/types"

export async function getMyXpQuery(): Promise<UserXp | null> {
  return getMyXp()
}
