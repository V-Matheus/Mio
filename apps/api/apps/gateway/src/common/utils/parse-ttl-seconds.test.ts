import { describe, expect, it } from "vitest"
import { parseTtlSeconds } from "./parse-ttl-seconds"

describe("parseTtlSeconds", () => {
  it("retorna defaultSeconds quando ttlStr é indefinido ou vazio", () => {
    expect(parseTtlSeconds(undefined)).toBe(86400)
    expect(parseTtlSeconds("")).toBe(86400)
    expect(parseTtlSeconds(undefined, 3600)).toBe(3600)
  })

  it("converte dias (d)", () => {
    expect(parseTtlSeconds("1d")).toBe(86400)
    expect(parseTtlSeconds("7d")).toBe(604800)
  })

  it("converte horas (h)", () => {
    expect(parseTtlSeconds("1h")).toBe(3600)
    expect(parseTtlSeconds("24h")).toBe(86400)
  })

  it("converte minutos (m)", () => {
    expect(parseTtlSeconds("1m")).toBe(60)
    expect(parseTtlSeconds("30m")).toBe(1800)
  })

  it("converte segundos (s)", () => {
    expect(parseTtlSeconds("60s")).toBe(60)
    expect(parseTtlSeconds("3600s")).toBe(3600)
  })

  it("trata números puros como segundos", () => {
    expect(parseTtlSeconds("120")).toBe(120)
  })

  it("retorna defaultSeconds para strings inválidas", () => {
    expect(parseTtlSeconds("invalid", 500)).toBe(500)
  })
})
