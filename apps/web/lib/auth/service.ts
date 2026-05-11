import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./schemas"

export type LoginResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string }

export type RegisterResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string }

export type ForgotPasswordResult = { ok: true } | { ok: false; error: string }

// Stub. Será substituído por mutations GraphQL ao Gateway quando o módulo
// `auth` do back existir. Mantém a forma final do contrato pra que apenas
// o corpo de cada método mude.

const MOCK_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHViLWlkLTEyMyIsIm5hbWUiOiJWaWN0b3IgU291c2EiLCJlbWFpbCI6InZpY3RvckBleGFtcGxlLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
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
}
