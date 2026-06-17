import { gatewayError, getGatewayClient } from "@/lib/gateway/client"
import {
  LOGIN_MUTATION,
  ME_QUERY,
  REGISTER_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  UPSERT_OAUTH_MUTATION,
} from "./graphql"
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./schemas"
import type {
  ForgotPasswordResult,
  LoginResult,
  MeResult,
  RegisterResult,
  UpsertOAuthInput,
  UpsertOAuthResult,
} from "./types"

// Reexporta o contrato de tipos do serviço para quem importa de `./service`.
export type * from "./types"

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    try {
      const { login } = await getGatewayClient().request(LOGIN_MUTATION, {
        input,
      })
      return { ok: true, accessToken: login.accessToken }
    } catch (error) {
      return { ok: false, error: gatewayError(error, "Falha no login") }
    }
  },

  async register(input: RegisterInput): Promise<RegisterResult> {
    try {
      const { register } = await getGatewayClient().request(REGISTER_MUTATION, {
        input: {
          email: input.email,
          name: input.name,
          password: input.password,
        },
      })
      return { ok: true, accessToken: register.accessToken }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha no cadastro"),
      }
    }
  },

  async requestPasswordReset(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResult> {
    try {
      await getGatewayClient().request(REQUEST_PASSWORD_RESET_MUTATION, {
        email: input.email,
      })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao solicitar redefinição"),
      }
    }
  },

  async me(accessToken: string): Promise<MeResult> {
    if (!accessToken) {
      return { ok: false, error: "Missing access token" }
    }
    try {
      const { me } = await getGatewayClient(accessToken).request(ME_QUERY)
      return { ok: true, user: { ...me, avatarUrl: me.avatarUrl ?? null } }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao carregar usuário"),
      }
    }
  },

  async upsertOAuthUser(input: UpsertOAuthInput): Promise<UpsertOAuthResult> {
    if (!input.providerAccountId || !input.email) {
      return { ok: false, error: "Missing OAuth identification" }
    }
    try {
      const { upsertOAuthUser } = await getGatewayClient().request(
        UPSERT_OAUTH_MUTATION,
        { input },
      )
      return { ok: true, accessToken: upsertOAuthUser.accessToken }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha no login social"),
      }
    }
  },
}
