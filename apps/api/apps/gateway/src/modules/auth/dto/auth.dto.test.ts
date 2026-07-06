import { describe, expect, it } from "vitest"
import { loginSchema } from "./login.input"
import { registerSchema } from "./register.input"
import { upsertOAuthSchema } from "./upsert-oauth.input"

describe("loginSchema", () => {
  it("aceita email válido e senha não-vazia", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success,
    ).toBe(true)
  })

  it("rejeita email inválido", () => {
    expect(
      loginSchema.safeParse({ email: "nope", password: "x" }).success,
    ).toBe(false)
  })

  it("rejeita senha vazia", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false)
  })
})

describe("registerSchema", () => {
  const valid = { email: "a@b.com", name: "Victor", password: "12345678" }

  it("aceita cadastro válido", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it("faz trim do nome", () => {
    const parsed = registerSchema.parse({ ...valid, name: "  Vic  " })
    expect(parsed.name).toBe("Vic")
  })

  it("rejeita nome com menos de 2 caracteres", () => {
    expect(registerSchema.safeParse({ ...valid, name: "V" }).success).toBe(
      false,
    )
  })

  it("rejeita nome com mais de 80 caracteres", () => {
    expect(
      registerSchema.safeParse({ ...valid, name: "a".repeat(81) }).success,
    ).toBe(false)
  })

  it("rejeita senha com menos de 8 caracteres", () => {
    expect(
      registerSchema.safeParse({ ...valid, password: "1234" }).success,
    ).toBe(false)
  })

  it("rejeita email inválido", () => {
    expect(registerSchema.safeParse({ ...valid, email: "x" }).success).toBe(
      false,
    )
  })
})

describe("upsertOAuthSchema", () => {
  const valid = {
    provider: "google",
    providerAccountId: "google-123",
    email: "a@b.com",
    name: "Victor",
    avatarUrl: "https://img/x.png",
  }

  it("aceita input OAuth válido", () => {
    expect(upsertOAuthSchema.safeParse(valid).success).toBe(true)
  })

  it("aceita avatarUrl nulo/ausente", () => {
    expect(
      upsertOAuthSchema.safeParse({ ...valid, avatarUrl: null }).success,
    ).toBe(true)
    const { avatarUrl: _omit, ...withoutAvatar } = valid
    expect(upsertOAuthSchema.safeParse(withoutAvatar).success).toBe(true)
  })

  it("rejeita provider fora de google/github", () => {
    expect(
      upsertOAuthSchema.safeParse({ ...valid, provider: "twitter" }).success,
    ).toBe(false)
  })

  it("rejeita providerAccountId vazio", () => {
    expect(
      upsertOAuthSchema.safeParse({ ...valid, providerAccountId: "" }).success,
    ).toBe(false)
  })

  it("rejeita email inválido", () => {
    expect(upsertOAuthSchema.safeParse({ ...valid, email: "x" }).success).toBe(
      false,
    )
  })
})
