import "server-only"

import { ClientError, GraphQLClient } from "graphql-request"
import { auth } from "@/auth"

const GATEWAY_GRAPHQL_URL =
  process.env.GATEWAY_GRAPHQL_URL ?? "http://localhost:3333/graphql"

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
 */
export function gatewayError(error: unknown, fallback: string): string {
  if (error instanceof ClientError) {
    const message = error.response.errors?.[0]?.message
    if (message) {
      return message
    }
  }
  return fallback
}
