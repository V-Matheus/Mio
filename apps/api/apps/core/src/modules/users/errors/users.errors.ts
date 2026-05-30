import { status } from "@grpc/grpc-js"
import { RpcException } from "@nestjs/microservices"

/**
 * Códigos de erro de domínio estáveis. Viajam como `message` da `RpcException`
 * (junto de um status gRPC apropriado) e são remapeados pelo gateway em
 * `GraphQLError.extensions.code`.
 */
export const UserErrorCode = {
  InvalidCredentials: "INVALID_CREDENTIALS",
  EmailInUse: "EMAIL_IN_USE",
  PasswordResetExpired: "PASSWORD_RESET_EXPIRED",
  UserNotFound: "USER_NOT_FOUND",
  InvalidProvider: "INVALID_PROVIDER",
} as const

export type UserErrorCode = (typeof UserErrorCode)[keyof typeof UserErrorCode]

const grpcStatusByCode: Record<UserErrorCode, number> = {
  INVALID_CREDENTIALS: status.UNAUTHENTICATED,
  EMAIL_IN_USE: status.ALREADY_EXISTS,
  PASSWORD_RESET_EXPIRED: status.FAILED_PRECONDITION,
  USER_NOT_FOUND: status.NOT_FOUND,
  INVALID_PROVIDER: status.INVALID_ARGUMENT,
}

export function userError(code: UserErrorCode): RpcException {
  return new RpcException({ code: grpcStatusByCode[code], message: code })
}
