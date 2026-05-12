import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./schemas"

export type LoginResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string }

export type RegisterResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string }

export type ForgotPasswordResult = { ok: true } | { ok: false; error: string }

export type MeUser = {
  code: string
  email: string
  name: string
  avatarUrl: string | null
}

export type MeResult = { ok: true; user: MeUser } | { ok: false; error: string }

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

// Stub. Será substituído por mutations/queries GraphQL ao Gateway quando o
// módulo `auth` do back existir. Mantém a forma final do contrato pra que
// apenas o corpo de cada método mude.
//
// O JWT carrega apenas `sub` (user code) — dados do usuário vêm de `me()`.
// Payload decodificado: { sub: "stub-id-123", iat: 1516239022 }
const MOCK_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHViLWlkLTEyMyIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

const MOCK_USER: MeUser = {
  code: "stub-id-123",
  email: "victor@example.com",
  name: "Victor Sousa",
  avatarUrl: null,
}

export const authService = {
  async login(_input: LoginInput): Promise<LoginResult> {
    return { ok: true, accessToken: MOCK_JWT }
  },

  async register(input: RegisterInput): Promise<RegisterResult> {
    console.log("[auth-service] register", {
      name: input.name,
      email: input.email,
    })
    return { ok: true, accessToken: MOCK_JWT }
  },

  async requestPasswordReset(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResult> {
    console.log("[auth-service] requestPasswordReset", { email: input.email })
    return { ok: true }
  },

  async me(accessToken: string): Promise<MeResult> {
    if (!accessToken) {
      return { ok: false, error: "Missing access token" }
    }
    return { ok: true, user: MOCK_USER }
  },

  async upsertOAuthUser(input: UpsertOAuthInput): Promise<UpsertOAuthResult> {
    if (!input.providerAccountId || !input.email) {
      return { ok: false, error: "Missing OAuth identification" }
    }
    console.log("[auth-service] upsertOAuthUser", {
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      email: input.email,
    })
    return { ok: true, accessToken: MOCK_JWT }
  },
}
