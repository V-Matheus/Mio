import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getGrpcTimeoutMs } from "./grpc-timeout"

describe("getGrpcTimeoutMs", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("retorna o valor padrão de 5000ms quando nenhuma env está definida", () => {
    delete process.env.GAMIFICATION_GRPC_TIMEOUT_MS
    delete process.env.CORE_GRPC_TIMEOUT_MS
    delete process.env.AUTH_GRPC_TIMEOUT_MS
    delete process.env.GATEWAY_GRPC_TIMEOUT_MS
    delete process.env.GRPC_TIMEOUT_MS

    expect(getGrpcTimeoutMs()).toBe(5000)
    expect(getGrpcTimeoutMs("GAMIFICATION_GRPC_TIMEOUT_MS")).toBe(5000)
    expect(getGrpcTimeoutMs("CUSTOM_ENV", 3000)).toBe(3000)
  })

  it("prioriza a variável de ambiente específica do serviço", () => {
    process.env.GAMIFICATION_GRPC_TIMEOUT_MS = "2500"
    process.env.GRPC_TIMEOUT_MS = "4000"

    expect(getGrpcTimeoutMs("GAMIFICATION_GRPC_TIMEOUT_MS")).toBe(2500)
  })

  it("usa CORE_GRPC_TIMEOUT_MS para serviços do Core quando a variável específica não está definida", () => {
    delete process.env.AUTH_GRPC_TIMEOUT_MS
    process.env.CORE_GRPC_TIMEOUT_MS = "4500"
    process.env.GATEWAY_GRPC_TIMEOUT_MS = "6000"

    expect(getGrpcTimeoutMs("AUTH_GRPC_TIMEOUT_MS")).toBe(4500)
    expect(getGrpcTimeoutMs("CATALOG_GRPC_TIMEOUT_MS")).toBe(4500)
    expect(getGrpcTimeoutMs("PROGRESS_GRPC_TIMEOUT_MS")).toBe(4500)
  })

  it("usa GATEWAY_GRPC_TIMEOUT_MS ou GRPC_TIMEOUT_MS quando a variável específica não está definida", () => {
    delete process.env.GAMIFICATION_GRPC_TIMEOUT_MS
    delete process.env.CORE_GRPC_TIMEOUT_MS
    process.env.GRPC_TIMEOUT_MS = "3500"

    expect(getGrpcTimeoutMs("GAMIFICATION_GRPC_TIMEOUT_MS")).toBe(3500)
    expect(getGrpcTimeoutMs()).toBe(3500)
  })

  it("ignora valores não numéricos ou <= 0 e retorna o fallback", () => {
    process.env.GAMIFICATION_GRPC_TIMEOUT_MS = "invalid"
    process.env.GRPC_TIMEOUT_MS = "-100"

    expect(getGrpcTimeoutMs("GAMIFICATION_GRPC_TIMEOUT_MS", 5000)).toBe(5000)
  })
})
