import { authService } from "@/lib/auth/service"
import type { MeUser } from "@/lib/auth/types"

export async function listUsersQuery(
  search?: string,
  accessToken?: string,
): Promise<{ ok: true; users: MeUser[] } | { ok: false; error: string }> {
  return authService.listUsers(search, accessToken)
}
