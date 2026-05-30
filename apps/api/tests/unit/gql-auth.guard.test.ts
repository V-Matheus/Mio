import type { ExecutionContext } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import type { JwtService } from "@nestjs/jwt"
import { GraphQLError } from "graphql"
import { afterEach, describe, expect, it, vi } from "vitest"
import { GqlAuthGuard } from "../../apps/gateway/src/modules/auth/guards/gql-auth.guard"

/** Faz o `GqlExecutionContext.create(ctx).getContext().req` resolver para `req`. */
function contextWithReq(req: unknown): ExecutionContext {
  vi.spyOn(GqlExecutionContext, "create").mockReturnValue({
    getContext: () => ({ req }),
  } as unknown as GqlExecutionContext)
  return {} as ExecutionContext
}

function guardWith(verify: ReturnType<typeof vi.fn>) {
  return new GqlAuthGuard({ verify } as unknown as JwtService)
}

describe("GqlAuthGuard", () => {
  afterEach(() => vi.restoreAllMocks())

  it("decodifica o Bearer, popula req.userCode e retorna true", () => {
    const verify = vi.fn().mockReturnValue({ sub: "user-1" })
    const req: { headers: { authorization: string }; userCode?: string } = {
      headers: { authorization: "Bearer good.token" },
    }
    const result = guardWith(verify).canActivate(contextWithReq(req))

    expect(result).toBe(true)
    expect(verify).toHaveBeenCalledWith("good.token")
    expect(req.userCode).toBe("user-1")
  })

  it("lança UNAUTHENTICATED quando não há header Bearer", () => {
    const verify = vi.fn()
    try {
      guardWith(verify).canActivate(contextWithReq({ headers: {} }))
      expect.unreachable("deveria ter lançado")
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError)
      expect((error as GraphQLError).extensions.code).toBe("UNAUTHENTICATED")
    }
    expect(verify).not.toHaveBeenCalled()
  })

  it("lança UNAUTHENTICATED quando o JWT é inválido", () => {
    const verify = vi.fn().mockImplementation(() => {
      throw new Error("invalid signature")
    })
    expect(() =>
      guardWith(verify).canActivate(
        contextWithReq({ headers: { authorization: "Bearer bad" } }),
      ),
    ).toThrow(GraphQLError)
  })
})
