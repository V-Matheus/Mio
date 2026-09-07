import { status } from "@grpc/grpc-js"
import { RpcException } from "@nestjs/microservices"

/**
 * Códigos de erro de domínio do módulo de conquistas.
 * Viajam como `message` da `RpcException` (junto do status gRPC apropriado)
 * e são remapeados pelo gateway em `GraphQLError.extensions.code`.
 */
export const AchievementsErrorCode = {
  InvalidUserCode: "INVALID_USER_CODE",
} as const

export type AchievementsErrorCode =
  (typeof AchievementsErrorCode)[keyof typeof AchievementsErrorCode]

const grpcStatusByCode: Record<AchievementsErrorCode, number> = {
  INVALID_USER_CODE: status.INVALID_ARGUMENT,
}

export function achievementsError(code: AchievementsErrorCode): RpcException {
  return new RpcException({ code: grpcStatusByCode[code], message: code })
}
