import { ClientError } from "graphql-request"
import { gatewayError, getGatewayClient } from "@/lib/gateway/client"

vi.mock("server-only", () => ({}))
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}))

type ClientErrorArgs = ConstructorParameters<typeof ClientError>

function makeClientError(messages: string[], status = 400): ClientError {
  return new ClientError(
    {
      status,
      errors: messages.map((message) => ({ message })),
    } as ClientErrorArgs[0],
    { query: "query {}" } as ClientErrorArgs[1],
  )
}

describe("getGatewayClient", () => {
  const original = process.env.INTERNAL_API_SECRET

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "test-secret"
  })

  afterEach(() => {
    process.env.INTERNAL_API_SECRET = original
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

describe("gatewayError", () => {
  it("returns the first GraphQL error message from a ClientError", () => {
    const error = makeClientError(["Credenciais inválidas", "outro erro"])

    expect(gatewayError(error, "fallback")).toBe("Credenciais inválidas")
  })

  it("returns the fallback for a non-ClientError", () => {
    expect(gatewayError(new Error("boom"), "fallback")).toBe("fallback")
  })

  it("returns the fallback when the ClientError has no error message", () => {
    const error = makeClientError([], 500)

    expect(gatewayError(error, "fallback")).toBe("fallback")
  })
})
