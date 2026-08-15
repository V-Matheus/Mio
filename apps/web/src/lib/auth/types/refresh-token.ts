import type { MeUser } from "./me"

export type RefreshTokenResult =
  | {
      ok: true
      accessToken: string
      refreshToken: string
      user: MeUser
    }
  | { ok: false; error: string }
