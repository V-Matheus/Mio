import { status } from "@grpc/grpc-js"
import { RpcException } from "@nestjs/microservices"
import { describe, expect, it } from "vitest"
import {
  type UserErrorCode,
  userError,
} from "./users.errors"

const cases: Array<[UserErrorCode, number]> = [
  ["INVALID_CREDENTIALS", status.UNAUTHENTICATED],
  ["EMAIL_IN_USE", status.ALREADY_EXISTS],
  ["PASSWORD_RESET_EXPIRED", status.FAILED_PRECONDITION],
  ["USER_NOT_FOUND", status.NOT_FOUND],
  ["INVALID_PROVIDER", status.INVALID_ARGUMENT],
]

describe("userError", () => {
  it("retorna uma RpcException", () => {
    expect(userError("USER_NOT_FOUND")).toBeInstanceOf(RpcException)
  })

  it.each(
    cases,
  )("%s mapeia para o status gRPC correto, com message = code", (code, grpcStatus) => {
    const error = userError(code).getError() as {
      code: number
      message: string
    }
    expect(error.code).toBe(grpcStatus)
    // o code de domínio viaja como `message` para o gateway remapear
    expect(error.message).toBe(code)
  })
})
