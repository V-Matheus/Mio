import { status } from "@grpc/grpc-js"
import { RpcException } from "@nestjs/microservices"

/**
 * Códigos de erro de domínio para o módulo de gamificação.
 * Viajam como `message` da `RpcException` (junto do status gRPC apropriado)
 * e são remapeados pelo gateway em `GraphQLError.extensions.code`.
 */
export const GamificationErrorCode = {
  UserNotFound: "USER_NOT_FOUND",
  InvalidXpRule: "INVALID_XP_RULE",
  LeaderboardUnavailable: "LEADERBOARD_UNAVAILABLE",
} as const

export type GamificationErrorCode =
  (typeof GamificationErrorCode)[keyof typeof GamificationErrorCode]

const grpcStatusByCode: Record<GamificationErrorCode, number> = {
  USER_NOT_FOUND: status.NOT_FOUND,
  INVALID_XP_RULE: status.INVALID_ARGUMENT,
  LEADERBOARD_UNAVAILABLE: status.UNAVAILABLE,
}

export function gamificationError(code: GamificationErrorCode): RpcException {
  return new RpcException({ code: grpcStatusByCode[code], message: code })
}
