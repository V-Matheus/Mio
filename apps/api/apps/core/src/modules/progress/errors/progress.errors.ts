import { status } from "@grpc/grpc-js"
import { RpcException } from "@nestjs/microservices"

/**
 * Códigos de erro de domínio para o módulo de progresso.
 */
export const ProgressErrorCode = {
  UserNotFound: "USER_NOT_FOUND",
  SectionNotFound: "SECTION_NOT_FOUND",
  LessonNotFound: "LESSON_NOT_FOUND",
} as const

export type ProgressErrorCode =
  (typeof ProgressErrorCode)[keyof typeof ProgressErrorCode]

const grpcStatusByCode: Record<ProgressErrorCode, number> = {
  USER_NOT_FOUND: status.NOT_FOUND,
  SECTION_NOT_FOUND: status.NOT_FOUND,
  LESSON_NOT_FOUND: status.NOT_FOUND,
}

export function progressError(code: ProgressErrorCode): RpcException {
  return new RpcException({ code: grpcStatusByCode[code], message: code })
}
