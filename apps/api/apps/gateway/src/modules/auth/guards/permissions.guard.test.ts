import type { ExecutionContext } from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import type { JwtService } from "@nestjs/jwt"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PermissionsGuard } from "./permissions.guard"

function mockContext(authHeader?: string): {
  context: ExecutionContext
  req: Record<string, unknown>
} {
  const req: Record<string, unknown> = {
    headers: authHeader ? { authorization: authHeader } : {},
  }

  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    getArgs: () => [null, null, { req }, null],
    getType: () => "graphql",
  } as unknown as ExecutionContext

  return { context, req }
}

describe("PermissionsGuard", () => {
  let guard: PermissionsGuard
  let jwt: JwtService
  let reflector: Reflector

  beforeEach(() => {
    jwt = {
      verify: vi.fn(),
    } as unknown as JwtService

    reflector = {
      getAllAndOverride: vi.fn(),
    } as unknown as Reflector

    guard = new PermissionsGuard(jwt, reflector)
  })

  it("should throw UNAUTHENTICATED if authorization header is missing", () => {
    const { context } = mockContext()
    expect(() => guard.canActivate(context)).toThrow("Não autenticado")
  })

  it("should throw UNAUTHENTICATED if token is invalid", () => {
    const { context } = mockContext("Bearer invalid-token")
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error("Invalid token")
    })

    expect(() => guard.canActivate(context)).toThrow("Não autenticado")
  })

  it("should set primaryRole to ADMIN when roles include ADMIN", () => {
    const { context, req } = mockContext("Bearer valid-token")
    vi.mocked(jwt.verify).mockReturnValue({
      sub: "user-123",
      roles: ["STUDENT", "ADMIN"],
    })
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(["ADMIN"])

    const result = guard.canActivate(context)
    expect(result).toBe(true)
    expect(req.userCode).toBe("user-123")
    expect(req.primaryRole).toBe("ADMIN")
  })

  it("should set primaryRole to TEACHER when roles include TEACHER but not ADMIN", () => {
    const { context, req } = mockContext("Bearer valid-token")
    vi.mocked(jwt.verify).mockReturnValue({
      sub: "user-456",
      roles: ["TEACHER"],
    })
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(["TEACHER", "ADMIN"])

    const result = guard.canActivate(context)
    expect(result).toBe(true)
    expect(req.primaryRole).toBe("TEACHER")
  })

  it("should throw FORBIDDEN if user does not have required role", () => {
    const { context } = mockContext("Bearer valid-token")
    vi.mocked(jwt.verify).mockReturnValue({
      sub: "user-789",
      roles: ["STUDENT"],
    })
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(["ADMIN", "TEACHER"])

    expect(() => guard.canActivate(context)).toThrow("Acesso negado")
  })

  it("should pass if route has no required roles metadata", () => {
    const { context } = mockContext("Bearer valid-token")
    vi.mocked(jwt.verify).mockReturnValue({
      sub: "user-000",
      roles: ["STUDENT"],
    })
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined)

    const result = guard.canActivate(context)
    expect(result).toBe(true)
  })
})
