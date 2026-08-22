import {
  LIST_USERS_QUERY,
  LOGIN_MUTATION,
  ME_QUERY,
  REFRESH_TOKEN_MUTATION,
  REGISTER_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  UPDATE_USER_ROLE_MUTATION,
  UPSERT_OAUTH_MUTATION,
} from "@/modules/auth/graphql"
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
} from "@/modules/auth/schemas"
import type {
  ForgotPasswordResult,
  LoginResult,
  MeResult,
  MeUser,
  RefreshTokenResult,
  RegisterResult,
  UpsertOAuthInput,
  UpsertOAuthResult,
} from "@/modules/auth/types"
import {
  gatewayError,
  getGatewayClient,
  getPublicGatewayClient,
} from "@/shared/gateway/client"
import type { UserRole } from "@/shared/gql/generated/graphql"

// Reexporta o contrato de tipos do serviço para quem importa de `./service`.
export type * from "@/modules/auth/types"

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    try {
      const client = getPublicGatewayClient()
      const { login } = await client.request(LOGIN_MUTATION, {
        input,
      })
      return {
        ok: true,
        accessToken: login.accessToken,
        refreshToken: login.refreshToken,
      }
    } catch (error) {
      return { ok: false, error: await gatewayError(error, "Falha no login") }
    }
  },

  async register(input: RegisterInput): Promise<RegisterResult> {
    try {
      const client = getPublicGatewayClient()
      const { register } = await client.request(REGISTER_MUTATION, {
        input: {
          email: input.email,
          name: input.name,
          password: input.password,
        },
      })
      return {
        ok: true,
        accessToken: register.accessToken,
        refreshToken: register.refreshToken,
      }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao cadastrar"),
      }
    }
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      const client = getPublicGatewayClient()
      const { refreshToken: data } = await client.request(
        REFRESH_TOKEN_MUTATION,
        {
          refreshToken,
        },
      )
      return {
        ok: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          code: data.user.code,
          email: data.user.email,
          name: data.user.name,
          avatarUrl: data.user.avatarUrl ?? null,
          roles: data.user.roles ?? [],
        },
      }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao renovar sessão"),
      }
    }
  },

  async requestPasswordReset(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordResult> {
    try {
      const client = getPublicGatewayClient()
      await client.request(REQUEST_PASSWORD_RESET_MUTATION, {
        email: input.email,
      })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha ao solicitar redefinição"),
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
        error: await gatewayError(error, "Falha ao carregar usuário"),
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
        error: await gatewayError(error, "Falha ao carregar usuários"),
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
        error: await gatewayError(error, "Falha ao atualizar papel do usuário"),
      }
    }
  },

  async upsertOAuthUser(input: UpsertOAuthInput): Promise<UpsertOAuthResult> {
    if (!input.providerAccountId || !input.email) {
      return { ok: false, error: "Missing OAuth identification" }
    }
    try {
      const client = getPublicGatewayClient()
      const { upsertOAuthUser } = await client.request(UPSERT_OAUTH_MUTATION, {
        input,
      })
      return {
        ok: true,
        accessToken: upsertOAuthUser.accessToken,
        refreshToken: upsertOAuthUser.refreshToken,
      }
    } catch (error) {
      return {
        ok: false,
        error: await gatewayError(error, "Falha no login social"),
      }
    }
  },
}
