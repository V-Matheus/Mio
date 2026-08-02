import { authService } from "@/lib/auth/service"
import type { MeResult } from "@/lib/auth/types"

export async function meQuery(accessToken?: string): Promise<MeResult> {
  return authService.me(accessToken)
}
