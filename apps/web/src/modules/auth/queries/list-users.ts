import { authService } from "@/modules/auth/services"
import type { MeUser } from "@/modules/auth/types"

export async function listUsersQuery(
  search?: string,
  accessToken?: string,
): Promise<{ ok: true; users: MeUser[] } | { ok: false; error: string }> {
  return authService.listUsers(search, accessToken)
}
