import { authService } from "@/modules/auth/services"
import type { MeResult } from "@/modules/auth/types"

export async function meQuery(accessToken?: string): Promise<MeResult> {
  return authService.me(accessToken)
}
