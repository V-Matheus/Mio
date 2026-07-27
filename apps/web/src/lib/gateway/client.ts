import "server-only"

import { ClientError, GraphQLClient } from "graphql-request"
import { auth, signOut } from "@/auth"

const GATEWAY_GRAPHQL_URL =
  process.env.GATEWAY_GRAPHQL_URL ?? "http://localhost:3333/graphql"

/**
 * Verifica se um erro retornado pelo GraphQL do Gateway é de falta de autenticação (UNAUTHENTICATED).
 */
export function isUnauthenticatedError(error: unknown): boolean {
  if (error instanceof ClientError) {
    const firstError = error.response.errors?.[0]
    const code = firstError?.extensions?.code
    const message = firstError?.message
    if (
      code === "UNAUTHENTICATED" ||
      message === "Não autenticado" ||
      message === "UNAUTHENTICATED"
    ) {
      return true
    }
  }
  return false
}

/**
 * Cria um client para o API Gateway (GraphQL). Server-side apenas.
 *
 * Injeta automaticamente o `x-internal-secret` (`INTERNAL_API_SECRET`) e o
 * `Authorization: Bearer <token>` obtido da sessão do NextAuth (`auth()`)
 * caso um accessToken não seja passado por parâmetro.
 */
export async function getGatewayClient(
  accessToken?: string,
): Promise<GraphQLClient> {
  const token = accessToken ?? (await auth())?.accessToken

  const headers: Record<string, string> = {
    "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
  }
  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  return new GraphQLClient(GATEWAY_GRAPHQL_URL, { headers })
}

/**
 * Extrai a mensagem do primeiro erro de uma falha do Gateway. As respostas de
 * erro já vêm com mensagem localizada em `extensions.code` + `message`.
 * Caso seja um erro de autenticação inválida (UNAUTHENTICATED), desloga o usuário usando o método signOut do NextAuth e redireciona para `/login`.
 */
export async function gatewayError(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (isUnauthenticatedError(error)) {
    await signOut({ redirectTo: "/login" })
  }
  if (error instanceof ClientError) {
    const message = error.response.errors?.[0]?.message
    if (message) {
      return message
    }
  }
  return fallback
}
