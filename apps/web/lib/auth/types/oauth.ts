export type OAuthProvider = "google" | "github"

export type UpsertOAuthInput = {
  provider: OAuthProvider
  providerAccountId: string
  email: string
  name: string
  avatarUrl: string | null
}

export type UpsertOAuthResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string }
