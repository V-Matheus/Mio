import { gatewayError, getGatewayClient } from "@/lib/gateway/client"
import type { UserRole } from "@/lib/gql/generated/graphql"
import {
  LIST_USERS_QUERY,
  LOGIN_MUTATION,
  ME_QUERY,
  REGISTER_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  UPDATE_USER_ROLE_MUTATION,
  UPSERT_OAUTH_MUTATION,
} from "./graphql"
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./schemas"
import type {
  ForgotPasswordResult,
  LoginResult,
  MeResult,
  MeUser,
  RegisterResult,
  UpsertOAuthInput,
  UpsertOAuthResult,
} from "./types"

// Reexporta o contrato de tipos do serviço para quem importa de `./service`.
export type * from "./types"

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    try {
      const client = await getGatewayClient()
      const { login } = await client.request(LOGIN_MUTATION, {
        input,
      })
      return { ok: true, accessToken: login.accessToken }
    } catch (error) {
      return { ok: false, error: gatewayError(error, "Falha no login") }
    }
  },

  async register(input: RegisterInput): Promise<RegisterResult> {
    try {
      const client = await getGatewayClient()
      const { register } = await client.request(REGISTER_MUTATION, {
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
        error: gatewayError(error, "Falha ao cadastrar"),
      }
    }
  },

  async requestPasswordReset(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResult> {
    try {
      const client = await getGatewayClient()
      await client.request(REQUEST_PASSWORD_RESET_MUTATION, {
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

  async me(accessToken?: string): Promise<MeResult> {
    try {
      const client = await getGatewayClient(accessToken)
      const { me } = await client.request(ME_QUERY)
      return { ok: true, user: { ...me, avatarUrl: me.avatarUrl ?? null } }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao carregar usuário"),
      }
    }
  },

  async listUsers(
    search?: string,
    accessToken?: string,
  ): Promise<{ ok: true; users: MeUser[] } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      const { listUsers } = await client.request(LIST_USERS_QUERY, { search })
      return {
        ok: true,
        users: listUsers.map((u) => ({
          ...u,
          avatarUrl: u.avatarUrl ?? null,
        })),
      }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao carregar usuários"),
      }
    }
  },

  async updateUserRole(
    userCode: string,
    role: string,
    accessToken?: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const client = await getGatewayClient(accessToken)
      await client.request(UPDATE_USER_ROLE_MUTATION, {
        userCode,
        role: role as UserRole,
      })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha ao atualizar papel do usuário"),
      }
    }
  },

  async upsertOAuthUser(input: UpsertOAuthInput): Promise<UpsertOAuthResult> {
    if (!input.providerAccountId || !input.email) {
      return { ok: false, error: "Missing OAuth identification" }
    }
    try {
      const client = await getGatewayClient()
      const { upsertOAuthUser } = await client.request(UPSERT_OAUTH_MUTATION, {
        input,
      })
      return { ok: true, accessToken: upsertOAuthUser.accessToken }
    } catch (error) {
      return {
        ok: false,
        error: gatewayError(error, "Falha no login social"),
      }
    }
  },
}
