import { getProfile } from "@/lib/profile/service"
import type { UserProfile } from "@/lib/profile/types"

export async function getProfileQuery(): Promise<UserProfile | null> {
  return getProfile()
}
