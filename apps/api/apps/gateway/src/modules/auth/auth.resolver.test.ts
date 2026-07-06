import { describe, expect, it, vi } from "vitest"
import { AuthResolver } from "./auth.resolver"
import type { AuthService } from "./auth.service"

function makeResolver() {
  const auth = {
    register: vi.fn().mockResolvedValue({ accessToken: "t", user: {} }),
    login: vi.fn().mockResolvedValue({ accessToken: "t", user: {} }),
    upsertOAuthUser: vi.fn().mockResolvedValue({ accessToken: "t", user: {} }),
    requestPasswordReset: vi.fn().mockResolvedValue(true),
    resetPassword: vi.fn().mockResolvedValue(true),
    me: vi.fn().mockResolvedValue({ code: "c" }),
  }
  return { resolver: new AuthResolver(auth as unknown as AuthService), auth }
}

describe("AuthResolver", () => {
  it("register delega para AuthService.register", async () => {
    const { resolver, auth } = makeResolver()
    const input = { email: "a@b.com", name: "V", password: "12345678" }
    await resolver.register(input)
    expect(auth.register).toHaveBeenCalledWith(input)
  })

  it("login delega para AuthService.login", async () => {
    const { resolver, auth } = makeResolver()
    const input = { email: "a@b.com", password: "12345678" }
    await resolver.login(input)
    expect(auth.login).toHaveBeenCalledWith(input)
  })

  it("upsertOAuthUser delega para AuthService.upsertOAuthUser", async () => {
    const { resolver, auth } = makeResolver()
    const input = {
      provider: "google",
      providerAccountId: "google-123",
      email: "a@b.com",
      name: "V",
      avatarUrl: null,
    }
    await resolver.upsertOAuthUser(input)
    expect(auth.upsertOAuthUser).toHaveBeenCalledWith(input)
  })

  it("requestPasswordReset delega o email", async () => {
    const { resolver, auth } = makeResolver()
    await resolver.requestPasswordReset("a@b.com")
    expect(auth.requestPasswordReset).toHaveBeenCalledWith("a@b.com")
  })

  it("resetPassword delega token e newPassword", async () => {
    const { resolver, auth } = makeResolver()
    await resolver.resetPassword("tok", "novaSenha")
    expect(auth.resetPassword).toHaveBeenCalledWith("tok", "novaSenha")
  })

  it("me delega o userCode resolvido pelo guard", async () => {
    const { resolver, auth } = makeResolver()
    await resolver.me("user-1")
    expect(auth.me).toHaveBeenCalledWith("user-1")
  })
})
