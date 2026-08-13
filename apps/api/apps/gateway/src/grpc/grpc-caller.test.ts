import { of, throwError } from "rxjs"
import { describe, expect, it } from "vitest"
import { GrpcCaller } from "./grpc-caller"

describe("GrpcCaller", () => {
  it("executa a chamada gRPC com sucesso", async () => {
    const caller = new GrpcCaller()
    const result = await caller.call(of({ id: 1, name: "Test" }))
    expect(result).toEqual({ id: 1, name: "Test" })
  })

  it("mapeia TimeoutError globalmente com código e mensagem amigável", async () => {
    const caller = new GrpcCaller({
      timeoutCode: "UNAVAILABLE",
      timeoutMessage: "Serviço indisponível (tempo limite excedido)",
    })

    const timeoutErr = new Error("timeout")
    timeoutErr.name = "TimeoutError"

    await expect(
      caller.call(throwError(() => timeoutErr)),
    ).rejects.toMatchObject({
      message: "Serviço indisponível (tempo limite excedido)",
      extensions: { code: "UNAVAILABLE" },
    })
  })

  it("mapeia erro de negócio usando errorMap", async () => {
    const caller = new GrpcCaller({
      errorMap: { USER_NOT_FOUND: "Usuário não encontrado" },
      defaultErrorMessage: "Erro padrão",
    })

    await expect(
      caller.call(throwError(() => ({ details: "USER_NOT_FOUND" }))),
    ).rejects.toMatchObject({
      message: "Usuário não encontrado",
      extensions: { code: "USER_NOT_FOUND" },
    })
  })

  it("utiliza defaultErrorMessage e INTERNAL_ERROR para erros desconhecidos", async () => {
    const caller = new GrpcCaller({
      defaultErrorMessage: "Erro customizado",
    })

    await expect(
      caller.call(throwError(() => new Error("Something broke"))),
    ).rejects.toMatchObject({
      message: "Erro customizado",
      extensions: { code: "INTERNAL_ERROR" },
    })
  })

  it("callNullable retorna null quando o código de erro corresponde a notFoundCodes", async () => {
    const caller = new GrpcCaller({
      errorMap: { TRACK_NOT_FOUND: "Trilha não encontrada" },
    })

    const result = await caller.callNullable(
      throwError(() => ({ details: "TRACK_NOT_FOUND" })),
      (data) => data,
      new Set(["TRACK_NOT_FOUND"]),
    )

    expect(result).toBeNull()
  })

  it("callNullable propaga erro quando não está no conjunto notFoundCodes", async () => {
    const caller = new GrpcCaller({
      errorMap: { FORBIDDEN: "Acesso negado" },
    })

    await expect(
      caller.callNullable(
        throwError(() => ({ details: "FORBIDDEN" })),
        (data) => data,
        new Set(["TRACK_NOT_FOUND"]),
      ),
    ).rejects.toMatchObject({
      message: "Acesso negado",
      extensions: { code: "FORBIDDEN" },
    })
  })
})
