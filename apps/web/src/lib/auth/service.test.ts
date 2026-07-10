import { authService } from "@/lib/auth/service"

const { mockRequest, mockGetClient } = vi.hoisted(() => {
  const mockRequest = vi.fn()
  const mockGetClient = vi.fn(() => ({ request: mockRequest }))
  return { mockRequest, mockGetClient }
})

vi.mock("@/lib/gateway/client", () => ({
  getGatewayClient: mockGetClient,
  gatewayError: (_error: unknown, fallback: string) => fallback,
}))

describe("authService", () => {
  beforeEach(() => {
    mockRequest.mockReset()
    mockGetClient.mockClear()
  })

  describe("login", () => {
    it("resolves with the accessToken from the login mutation", async () => {
      mockRequest.mockResolvedValueOnce({ login: { accessToken: "jwt-123" } })

      const result = await authService.login({
        email: "user@example.com",
        password: "secret",
      })

      expect(result).toEqual({ ok: true, accessToken: "jwt-123" })
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        input: { email: "user@example.com", password: "secret" },
      })
    })

    it("resolves with ok: false when the gateway rejects", async () => {
      mockRequest.mockRejectedValueOnce(new Error("boom"))

      const result = await authService.login({
        email: "user@example.com",
        password: "secret",
      })

      expect(result).toEqual({ ok: false, error: expect.any(String) })
    })
  })

  describe("register", () => {
    it("sends only email/name/password and returns the accessToken", async () => {
      mockRequest.mockResolvedValueOnce({
        register: { accessToken: "jwt-456" },
      })

      const result = await authService.register({
        name: "Victor",
        email: "victor@example.com",
        password: "Strong1Pass",
        confirmPassword: "Strong1Pass",
        terms: "on",
      })

      expect(result).toEqual({ ok: true, accessToken: "jwt-456" })
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        input: {
          email: "victor@example.com",
          name: "Victor",
          password: "Strong1Pass",
        },
      })
    })

    it("resolves with ok: false when the gateway rejects", async () => {
      mockRequest.mockRejectedValueOnce(new Error("email in use"))

      const result = await authService.register({
        name: "Victor",
        email: "victor@example.com",
        password: "Strong1Pass",
        confirmPassword: "Strong1Pass",
        terms: "on",
      })

      expect(result).toEqual({ ok: false, error: expect.any(String) })
    })
  })

  describe("requestPasswordReset", () => {
    it("resolves with ok: true when the mutation succeeds", async () => {
      mockRequest.mockResolvedValueOnce({ requestPasswordReset: true })

      const result = await authService.requestPasswordReset({
        email: "anyone@example.com",
      })

      expect(result).toEqual({ ok: true })
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        email: "anyone@example.com",
      })
    })

    it("resolves with ok: false when the gateway rejects", async () => {
      mockRequest.mockRejectedValueOnce(new Error("boom"))

      const result = await authService.requestPasswordReset({
        email: "anyone@example.com",
      })

      expect(result).toEqual({ ok: false, error: expect.any(String) })
    })
  })

  describe("me", () => {
    it("queries with a Bearer token and returns the user", async () => {
      mockRequest.mockResolvedValueOnce({
        me: {
          code: "abc123",
          email: "victor@example.com",
          name: "Victor",
          avatarUrl: null,
          roles: ["STUDENT"],
        },
      })

      const result = await authService.me("any-token")

      expect(result).toEqual({
        ok: true,
        user: {
          code: "abc123",
          email: "victor@example.com",
          name: "Victor",
          avatarUrl: null,
          roles: ["STUDENT"],
        },
      })
      expect(mockGetClient).toHaveBeenCalledWith("any-token")
    })

    it("resolves with ok: false when no token is provided", async () => {
      const result = await authService.me("")

      expect(result).toEqual({ ok: false, error: expect.any(String) })
      expect(mockRequest).not.toHaveBeenCalled()
    })

    it("resolves with ok: false when the gateway rejects", async () => {
      mockRequest.mockRejectedValueOnce(new Error("unauthenticated"))

      const result = await authService.me("expired-token")

      expect(result).toEqual({ ok: false, error: expect.any(String) })
    })
  })

  describe("upsertOAuthUser", () => {
    it("returns the accessToken when input is complete", async () => {
      mockRequest.mockResolvedValueOnce({
        upsertOAuthUser: { accessToken: "jwt-oauth" },
      })

      const result = await authService.upsertOAuthUser({
        provider: "google",
        providerAccountId: "google-123",
        email: "victor@example.com",
        name: "Victor",
        avatarUrl: null,
      })

      expect(result).toEqual({ ok: true, accessToken: "jwt-oauth" })
      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        input: {
          provider: "google",
          providerAccountId: "google-123",
          email: "victor@example.com",
          name: "Victor",
          avatarUrl: null,
        },
      })
    })

    it("resolves with ok: false when providerAccountId is missing", async () => {
      const result = await authService.upsertOAuthUser({
        provider: "github",
        providerAccountId: "",
        email: "victor@example.com",
        name: "Victor",
        avatarUrl: null,
      })

      expect(result).toEqual({ ok: false, error: expect.any(String) })
      expect(mockRequest).not.toHaveBeenCalled()
    })

    it("resolves with ok: false when email is missing", async () => {
      const result = await authService.upsertOAuthUser({
        provider: "google",
        providerAccountId: "google-123",
        email: "",
        name: "Victor",
        avatarUrl: null,
      })

      expect(result).toEqual({ ok: false, error: expect.any(String) })
      expect(mockRequest).not.toHaveBeenCalled()
    })

    it("resolves with ok: false when the gateway rejects", async () => {
      mockRequest.mockRejectedValueOnce(new Error("invalid provider"))

      const result = await authService.upsertOAuthUser({
        provider: "google",
        providerAccountId: "google-123",
        email: "victor@example.com",
        name: "Victor",
        avatarUrl: null,
      })

      expect(result).toEqual({ ok: false, error: expect.any(String) })
    })
  })
})
