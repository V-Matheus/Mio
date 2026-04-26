import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./schemas"

export type LoginResult =
  | { ok: true; userId: string }
  | { ok: false; error: string }

export type RegisterResult =
  | { ok: true; userId: string }
  | { ok: false; error: string }

export type ForgotPasswordResult = { ok: true } | { ok: false; error: string }

// Stub. Será substituído por mutations GraphQL ao Gateway quando o módulo
// `auth` do back existir. Mantém a forma final do contrato pra que apenas
// o corpo de cada método mude.
export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    console.log("[auth-service] login", { email: input.email })
    return { ok: true, userId: "stub-user-id" }
  },

  async register(input: RegisterInput): Promise<RegisterResult> {
    console.log("[auth-service] register", {
      name: input.name,
      email: input.email,
    })
    return { ok: true, userId: "stub-user-id" }
  },

  async requestPasswordReset(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResult> {
    console.log("[auth-service] requestPasswordReset", { email: input.email })
    return { ok: true }
  },
}
