import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getGrpcTimeoutMs, parsePositiveInteger } from "./grpc-timeout"

describe("parsePositiveInteger", () => {
  it("aceita apenas números inteiros estritamente positivos", () => {
    expect(parsePositiveInteger("5000")).toBe(5000)
    expect(parsePositiveInteger(" 3000 ")).toBe(3000)
    expect(parsePositiveInteger("1")).toBe(1)
  })

  it("rejeita valores malformados, decimais, notação científica e unidades", () => {
    expect(parsePositiveInteger("1e3")).toBeUndefined()
    expect(parsePositiveInteger("5000ms")).toBeUndefined()
    expect(parsePositiveInteger("5.5")).toBeUndefined()
    expect(parsePositiveInteger("0")).toBeUndefined()
    expect(parsePositiveInteger("-100")).toBeUndefined()
    expect(parsePositiveInteger("invalid")).toBeUndefined()
    expect(parsePositiveInteger("")).toBeUndefined()
    expect(parsePositiveInteger(undefined)).toBeUndefined()
  })
})

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

  it("rejeita valores malformados como '1e3', '5000ms' e '5.5' em todas as posições e retorna o fallback", () => {
    delete process.env.GATEWAY_GRPC_TIMEOUT_MS
    delete process.env.GRPC_TIMEOUT_MS

    // Rejeita prefixos em service env var
    process.env.GAMIFICATION_GRPC_TIMEOUT_MS = "1e3"
    expect(getGrpcTimeoutMs("GAMIFICATION_GRPC_TIMEOUT_MS", 5000)).toBe(5000)

    process.env.GAMIFICATION_GRPC_TIMEOUT_MS = "5000ms"
    expect(getGrpcTimeoutMs("GAMIFICATION_GRPC_TIMEOUT_MS", 5000)).toBe(5000)

    process.env.GAMIFICATION_GRPC_TIMEOUT_MS = "5.5"
    expect(getGrpcTimeoutMs("GAMIFICATION_GRPC_TIMEOUT_MS", 5000)).toBe(5000)

    delete process.env.GAMIFICATION_GRPC_TIMEOUT_MS

    // Rejeita prefixos em CORE_GRPC_TIMEOUT_MS
    process.env.CORE_GRPC_TIMEOUT_MS = "1e3"
    expect(getGrpcTimeoutMs("AUTH_GRPC_TIMEOUT_MS", 5000)).toBe(5000)

    process.env.CORE_GRPC_TIMEOUT_MS = "5000ms"
    expect(getGrpcTimeoutMs("AUTH_GRPC_TIMEOUT_MS", 5000)).toBe(5000)

    process.env.CORE_GRPC_TIMEOUT_MS = "5.5"
    expect(getGrpcTimeoutMs("AUTH_GRPC_TIMEOUT_MS", 5000)).toBe(5000)

    delete process.env.CORE_GRPC_TIMEOUT_MS

    // Rejeita prefixos em GATEWAY_GRPC_TIMEOUT_MS
    process.env.GATEWAY_GRPC_TIMEOUT_MS = "1e3"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)

    process.env.GATEWAY_GRPC_TIMEOUT_MS = "5000ms"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)

    process.env.GATEWAY_GRPC_TIMEOUT_MS = "5.5"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)

    delete process.env.GATEWAY_GRPC_TIMEOUT_MS

    // Rejeita prefixos em GRPC_TIMEOUT_MS
    process.env.GRPC_TIMEOUT_MS = "1e3"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)

    process.env.GRPC_TIMEOUT_MS = "5000ms"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)

    process.env.GRPC_TIMEOUT_MS = "5.5"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)

    process.env.GRPC_TIMEOUT_MS = "-100"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)

    process.env.GRPC_TIMEOUT_MS = "invalid"
    expect(getGrpcTimeoutMs(undefined, 5000)).toBe(5000)
  })
})
