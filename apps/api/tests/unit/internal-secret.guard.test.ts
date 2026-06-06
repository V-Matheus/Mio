import type { ExecutionContext } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { GraphQLError } from "graphql"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { InternalSecretGuard } from "../../apps/gateway/src/common/guards/internal-secret.guard"

const SECRET = "s3cr3t"

/** Monta um ExecutionContext GraphQL cujo `req` resolve para o dado fornecido. */
function gqlContext(req: unknown): ExecutionContext {
  vi.spyOn(GqlExecutionContext, "create").mockReturnValue({
    getContext: () => ({ req }),
  } as unknown as GqlExecutionContext)
  return { getType: () => "graphql" } as unknown as ExecutionContext
}

describe("InternalSecretGuard", () => {
  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = SECRET
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env.INTERNAL_API_SECRET = SECRET
  })

  it("permite quando o header x-internal-secret confere", () => {
    const ctx = gqlContext({ headers: { "x-internal-secret": SECRET } })
    expect(new InternalSecretGuard().canActivate(ctx)).toBe(true)
  })

  it("bloqueia (FORBIDDEN) quando o segredo não confere", () => {
    const ctx = gqlContext({ headers: { "x-internal-secret": "wrong" } })
    try {
      new InternalSecretGuard().canActivate(ctx)
      expect.unreachable("deveria ter lançado")
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError)
      expect((error as GraphQLError).extensions.code).toBe("FORBIDDEN")
    }
  })

  it("bloqueia quando o header está ausente", () => {
    const ctx = gqlContext({ headers: {} })
    expect(() => new InternalSecretGuard().canActivate(ctx)).toThrow(
      GraphQLError,
    )
  })

  it("falha quando INTERNAL_API_SECRET não está configurado", () => {
    process.env.INTERNAL_API_SECRET = ""
    const ctx = gqlContext({ headers: { "x-internal-secret": "anything" } })
    try {
      new InternalSecretGuard().canActivate(ctx)
      expect.unreachable("deveria ter lançado")
    } catch (error) {
      expect((error as GraphQLError).extensions.code).toBe(
        "INTERNAL_SERVER_ERROR",
      )
    }
  })

  it("ignora contextos não-GraphQL (ex.: health REST)", () => {
    const ctx = {
      getType: () => "http",
    } as unknown as ExecutionContext
    expect(new InternalSecretGuard().canActivate(ctx)).toBe(true)
  })
})
