import { getProfile } from "@/lib/profile/service"
import type { UserProfile } from "@/lib/profile/types"

export async function getProfileQuery(
  userCode?: string,
): Promise<UserProfile | null> {
  return getProfile(userCode)
}
