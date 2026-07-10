import type { JwtService } from "@nestjs/jwt"
import type { ClientGrpc } from "@nestjs/microservices"
import { GraphQLError } from "graphql"
import { of, throwError } from "rxjs"
import { describe, expect, it, vi } from "vitest"
import { AuthService } from "./auth.service"

const grpcUser = {
  code: "abc123",
  email: "victor@example.com",
  name: "Victor",
  avatarUrl: "",
}

function setup(usersService: Record<string, unknown>) {
  const client = {
    getService: vi.fn().mockReturnValue(usersService),
  } as unknown as ClientGrpc
  const jwt = {
    sign: vi.fn().mockReturnValue("signed.jwt"),
  } as unknown as JwtService
  const service = new AuthService(client, jwt)
  service.onModuleInit()
  return { service, jwt }
}

describe("AuthService", () => {
  it("login emite JWT com sub = user.code e devolve o usuário", async () => {
    const { service, jwt } = setup({
      validateCredentials: vi.fn().mockReturnValue(of(grpcUser)),
    })

    const result = await service.login({
      email: grpcUser.email,
      password: "pw",
    })

    expect(jwt.sign).toHaveBeenCalledWith({ sub: grpcUser.code, roles: [] })
    expect(result.accessToken).toBe("signed.jwt")
    expect(result.user).toEqual({
      code: grpcUser.code,
      email: grpcUser.email,
      name: grpcUser.name,
      avatarUrl: null,
      roles: [],
    })
  })

  it("register devolve AuthPayload", async () => {
    const { service } = setup({
      register: vi.fn().mockReturnValue(of(grpcUser)),
    })
    const result = await service.register({
      email: grpcUser.email,
      name: grpcUser.name,
      password: "pw",
    })
    expect(result.accessToken).toBe("signed.jwt")
  })

  it("upsertOAuthUser emite JWT e devolve AuthPayload", async () => {
    const upsertOAuthUser = vi.fn().mockReturnValue(of(grpcUser))
    const { service, jwt } = setup({ upsertOAuthUser })

    const result = await service.upsertOAuthUser({
      provider: "google",
      providerAccountId: "google-123",
      email: grpcUser.email,
      name: grpcUser.name,
      avatarUrl: null,
    })

    expect(upsertOAuthUser).toHaveBeenCalledWith({
      provider: "google",
      providerAccountId: "google-123",
      email: grpcUser.email,
      name: grpcUser.name,
      avatarUrl: "",
    })
    expect(jwt.sign).toHaveBeenCalledWith({ sub: grpcUser.code, roles: [] })
    expect(result.accessToken).toBe("signed.jwt")
    expect(result.user.code).toBe(grpcUser.code)
  })

  it("mapeia erro gRPC para GraphQLError com extensions.code", async () => {
    const { service } = setup({
      validateCredentials: vi
        .fn()
        .mockReturnValue(
          throwError(() => ({ details: "INVALID_CREDENTIALS" })),
        ),
    })

    try {
      await service.login({ email: grpcUser.email, password: "wrong" })
      expect.unreachable("deveria ter lançado")
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError)
      expect((error as GraphQLError).extensions.code).toBe(
        "INVALID_CREDENTIALS",
      )
    }
  })

  it("erro desconhecido vira INTERNAL_ERROR", async () => {
    const { service } = setup({
      findByCode: vi.fn().mockReturnValue(throwError(() => new Error("boom"))),
    })
    try {
      await service.me("abc123")
      expect.unreachable("deveria ter lançado")
    } catch (error) {
      expect((error as GraphQLError).extensions.code).toBe("INTERNAL_ERROR")
    }
  })

  it("requestPasswordReset sempre retorna true", async () => {
    const { service } = setup({
      issuePasswordReset: vi
        .fn()
        .mockReturnValue(of({ token: "t", expiresAt: "x" })),
    })
    await expect(service.requestPasswordReset(grpcUser.email)).resolves.toBe(
      true,
    )
  })

  it("me resolve o usuário por code", async () => {
    const { service } = setup({
      findByCode: vi.fn().mockReturnValue(of(grpcUser)),
    })
    const user = await service.me(grpcUser.code)
    expect(user.code).toBe(grpcUser.code)
  })
})
