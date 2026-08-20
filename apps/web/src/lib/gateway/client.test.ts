import { ClientError } from "graphql-request"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  gatewayError,
  getGatewayClient,
  getPublicGatewayClient,
} from "@/lib/gateway/client"

vi.mock("server-only", () => ({}))
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}))

type ClientErrorArgs = ConstructorParameters<typeof ClientError>

function makeClientError(
  messages: string[],
  status = 400,
  code?: string,
): ClientError {
  return new ClientError(
    {
      status,
      errors: messages.map((message) => ({
        message,
        ...(code ? { extensions: { code } } : {}),
      })),
    } as unknown as ClientErrorArgs[0],
    { query: "query {}" } as ClientErrorArgs[1],
  )
}

describe("getGatewayClient", () => {
  const original = process.env.INTERNAL_API_SECRET

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "test-secret"
  })

  afterEach(() => {
    if (original === undefined) {
      delete process.env.INTERNAL_API_SECRET
    } else {
      process.env.INTERNAL_API_SECRET = original
    }
  })

  it("always sends the internal secret header", async () => {
    const client = await getGatewayClient()

    expect(client.requestConfig.headers).toMatchObject({
      "x-internal-secret": "test-secret",
    })
  })

  it("does not include authorization when no access token is given and session has no token", async () => {
    const client = await getGatewayClient()

    expect(client.requestConfig.headers).not.toHaveProperty("authorization")
  })

  it("includes the Bearer token alongside the secret when given", async () => {
    const client = await getGatewayClient("jwt-123")

    expect(client.requestConfig.headers).toMatchObject({
      "x-internal-secret": "test-secret",
      authorization: "Bearer jwt-123",
    })
  })

  it("falls back to an empty secret when the env var is unset", async () => {
    process.env.INTERNAL_API_SECRET = ""
    const client = await getGatewayClient()

    expect(client.requestConfig.headers).toMatchObject({
      "x-internal-secret": "",
    })
  })
})

describe("getPublicGatewayClient", () => {
  const original = process.env.INTERNAL_API_SECRET

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "test-secret"
  })

  afterEach(() => {
    if (original === undefined) {
      delete process.env.INTERNAL_API_SECRET
    } else {
      process.env.INTERNAL_API_SECRET = original
    }
  })

  it("creates a client with internal secret and without authorization header", () => {
    const client = getPublicGatewayClient()

    expect(client.requestConfig.headers).toMatchObject({
      "x-internal-secret": "test-secret",
    })
    expect(client.requestConfig.headers).not.toHaveProperty("authorization")
  })
})

describe("gatewayError", () => {
  it("returns the first GraphQL error message from a ClientError", async () => {
    const error = makeClientError(["Credenciais inválidas", "outro erro"])

    expect(await gatewayError(error, "fallback")).toBe("Credenciais inválidas")
  })

  it("returns the fallback for a non-ClientError", async () => {
    expect(await gatewayError(new Error("boom"), "fallback")).toBe("fallback")
  })

  it("returns the fallback when the ClientError has no error message", async () => {
    const error = makeClientError([], 500)

    expect(await gatewayError(error, "fallback")).toBe("fallback")
  })
})
