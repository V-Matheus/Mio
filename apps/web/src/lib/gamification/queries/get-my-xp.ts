import { getMyXp } from "@/lib/gamification/service"
import type { UserXp } from "@/lib/gamification/types"

export async function getMyXpQuery(): Promise<UserXp | null> {
  return getMyXp()
}
