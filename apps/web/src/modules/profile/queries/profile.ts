import { getProfile } from "@/modules/profile/services"
import type { UserProfile } from "@/modules/profile/types"

export async function getProfileQuery(): Promise<UserProfile | null> {
  return getProfile()
}
