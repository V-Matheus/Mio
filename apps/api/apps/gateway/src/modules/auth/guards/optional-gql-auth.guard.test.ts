import type { ExecutionContext } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import type { JwtService } from "@nestjs/jwt"
import { afterEach, describe, expect, it, vi } from "vitest"
import { OptionalGqlAuthGuard } from "./optional-gql-auth.guard"

/** Faz o `GqlExecutionContext.create(ctx).getContext().req` resolver para `req`. */
function contextWithReq(req: unknown): ExecutionContext {
  vi.spyOn(GqlExecutionContext, "create").mockReturnValue({
    getContext: () => ({ req }),
  } as unknown as GqlExecutionContext)
  return {} as ExecutionContext
}

function guardWith(verify: ReturnType<typeof vi.fn>) {
  return new OptionalGqlAuthGuard({ verify } as unknown as JwtService)
}

describe("OptionalGqlAuthGuard", () => {
  afterEach(() => vi.restoreAllMocks())

  it("sem header: permite e não popula userCode", () => {
    const verify = vi.fn()
    const req: { headers: object; userCode?: string } = { headers: {} }

    expect(guardWith(verify).canActivate(contextWithReq(req))).toBe(true)
    expect(req.userCode).toBeUndefined()
    expect(verify).not.toHaveBeenCalled()
  })

  it("Bearer válido: popula req.userCode", () => {
    const verify = vi.fn().mockReturnValue({ sub: "user-1" })
    const req: { headers: { authorization: string }; userCode?: string } = {
      headers: { authorization: "Bearer good.token" },
    }

    expect(guardWith(verify).canActivate(contextWithReq(req))).toBe(true)
    expect(verify).toHaveBeenCalledWith("good.token")
    expect(req.userCode).toBe("user-1")
  })

  it("Bearer inválido: permite como anônimo, sem userCode", () => {
    const verify = vi.fn().mockImplementation(() => {
      throw new Error("invalid signature")
    })
    const req: { headers: { authorization: string }; userCode?: string } = {
      headers: { authorization: "Bearer bad" },
    }

    expect(guardWith(verify).canActivate(contextWithReq(req))).toBe(true)
    expect(req.userCode).toBeUndefined()
  })
})
