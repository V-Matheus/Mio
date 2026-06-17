import "server-only"

import { ClientError, GraphQLClient } from "graphql-request"

const GATEWAY_GRAPHQL_URL =
  process.env.GATEWAY_GRAPHQL_URL ?? "http://localhost:3333/graphql"

/**
 * Cria um client para o API Gateway (GraphQL). Server-side apenas — o browser
 * nunca fala direto com o Gateway (ver `apps/web/CLAUDE.md`).
 *
 * Toda request leva o `x-internal-secret` (`INTERNAL_API_SECRET`): o Gateway só
 * aceita tráfego server-to-server. Como roda só no servidor, o segredo nunca
 * chega ao browser.
 *
 * Passe o `accessToken` da session NextAuth para enviar `Authorization: Bearer`
 * em operações autenticadas (ex.: `me`).
 */
export function getGatewayClient(accessToken?: string): GraphQLClient {
  const headers: Record<string, string> = {
    "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
  }
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`
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
