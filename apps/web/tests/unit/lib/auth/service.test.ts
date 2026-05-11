import { authService } from "../../../../lib/auth/service"

describe("authService", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("login", () => {
    it("should resolve with ok: true and an accessToken", async () => {
      const result = await authService.login({
        email: "user@example.com",
        password: "anything",
      })

      expect(result).toEqual({
        ok: true,
        accessToken: expect.any(String),
      })
    })

    it("should not log the password", async () => {
      const logSpy = vi.spyOn(console, "log")

      await authService.login({
        email: "user@example.com",
        password: "secret",
      })

      const serialized = JSON.stringify(logSpy.mock.calls)
      expect(serialized).not.toContain("secret")
    })
  })

  describe("register", () => {
    it("should resolve with ok: true and an accessToken", async () => {
      const result = await authService.register({
        name: "Victor",
        email: "victor@example.com",
        password: "Strong1Pass",
        confirmPassword: "Strong1Pass",
        terms: "on",
      })

      expect(result).toEqual({
        ok: true,
        accessToken: expect.any(String),
      })
    })

    it("should not log the password", async () => {
      const logSpy = vi.spyOn(console, "log")

      await authService.register({
        name: "Victor",
        email: "victor@example.com",
        password: "Strong1Pass",
        confirmPassword: "Strong1Pass",
        terms: "on",
      })

      const serialized = JSON.stringify(logSpy.mock.calls)
      expect(serialized).not.toContain("Strong1Pass")
    })
  })

  describe("requestPasswordReset", () => {
    it("should resolve with ok: true regardless of email", async () => {
      const result = await authService.requestPasswordReset({
        email: "anyone@example.com",
      })

      expect(result).toEqual({ ok: true })
    })
  })
})
