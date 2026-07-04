import { status } from "@grpc/grpc-js"
import { RpcException } from "@nestjs/microservices"

/**
 * Códigos de erro de domínio estáveis do catálogo. Viajam como `message` da
 * `RpcException` (junto de um status gRPC apropriado) e são remapeados pelo
 * gateway em `GraphQLError.extensions.code`.
 */
export const CatalogErrorCode = {
  TrackNotFound: "TRACK_NOT_FOUND",
  LessonNotFound: "LESSON_NOT_FOUND",
  SectionNotFound: "SECTION_NOT_FOUND",
  UserNotFound: "USER_NOT_FOUND",
} as const

export type CatalogErrorCode =
  (typeof CatalogErrorCode)[keyof typeof CatalogErrorCode]

const grpcStatusByCode: Record<CatalogErrorCode, number> = {
  TRACK_NOT_FOUND: status.NOT_FOUND,
  LESSON_NOT_FOUND: status.NOT_FOUND,
  SECTION_NOT_FOUND: status.NOT_FOUND,
  USER_NOT_FOUND: status.NOT_FOUND,
}

export function catalogError(code: CatalogErrorCode): RpcException {
  return new RpcException({ code: grpcStatusByCode[code], message: code })
}
