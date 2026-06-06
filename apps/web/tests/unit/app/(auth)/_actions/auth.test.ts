import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  signInWithProvider,
} from "@/app/(auth)/_actions/auth"
import { signIn } from "@/auth"
import { authService } from "@/lib/auth/service"

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    constructor(message?: string) {
      super(message)
      this.name = "AuthError"
    }
  },
}))

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  auth: vi.fn().mockResolvedValue(null),
}))

vi.mock("@/lib/auth/service", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
  },
}))

const initialState = { ok: false }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("signInWithProvider", () => {
  it("should call signIn with provider and redirectTo /home", async () => {
    const formData = new FormData()
    formData.set("provider", "google")

    await signInWithProvider(formData)

    expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/home" })
  })

  it("should return early when provider is missing", async () => {
    await signInWithProvider(new FormData())

    expect(signIn).not.toHaveBeenCalled()
  })

  it("should support github provider", async () => {
    const formData = new FormData()
    formData.set("provider", "github")

    await signInWithProvider(formData)

    expect(signIn).toHaveBeenCalledWith("github", { redirectTo: "/home" })
  })
})

describe("loginAction", () => {
  it("should return field errors when validation fails", async () => {
    const formData = new FormData()
    formData.set("email", "not-an-email")
    formData.set("password", "")

    const result = await loginAction(initialState, formData)

    expect(result.ok).toBe(false)
    expect(result.fieldErrors).toBeDefined()
    expect(authService.login).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("should echo all submitted values when validation fails", async () => {
    const formData = new FormData()
    formData.set("email", "not-an-email")
    formData.set("password", "secret")

    const result = await loginAction(initialState, formData)

    expect(result.values).toEqual({
      email: "not-an-email",
      password: "secret",
    })
  })

  it("should call signIn with credentials provider and redirectTo /home", async () => {
    vi.mocked(signIn).mockResolvedValue(undefined as never)
    const formData = new FormData()
    formData.set("email", "user@example.com")
    formData.set("password", "secret")

    await loginAction(initialState, formData)

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "secret",
      redirectTo: "/home",
    })
    expect(authService.login).not.toHaveBeenCalled()
  })

  it("should return ok: true when signIn succeeds", async () => {
    vi.mocked(signIn).mockResolvedValue(undefined as never)
    const formData = new FormData()
    formData.set("email", "user@example.com")
    formData.set("password", "secret")

    const result = await loginAction(initialState, formData)

    expect(result).toEqual({ ok: true, section: null })
  })

  it("should return error message and echo values when signIn throws AuthError", async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError("CredentialsSignin"))
    const formData = new FormData()
    formData.set("email", "user@example.com")
    formData.set("password", "wrong")

    const result = await loginAction(initialState, formData)

    expect(result).toEqual({
      ok: false,
      message: "Email ou senha inválidos",
      values: { email: "user@example.com", password: "wrong" },
      section: null,
    })
    expect(redirect).not.toHaveBeenCalled()
  })

  it("should rethrow non-AuthError exceptions", async () => {
    const unexpected = new Error("network down")
    vi.mocked(signIn).mockRejectedValue(unexpected)
    const formData = new FormData()
    formData.set("email", "user@example.com")
    formData.set("password", "secret")

    await expect(loginAction(initialState, formData)).rejects.toBe(unexpected)
  })
})

describe("registerAction", () => {
  const validFormData = () => {
    const formData = new FormData()
    formData.set("name", "Victor Sousa")
    formData.set("email", "victor@example.com")
    formData.set("password", "Strong1Pass")
    formData.set("confirmPassword", "Strong1Pass")
    formData.set("terms", "on")
    return formData
  }

  it("should return field errors when validation fails", async () => {
    const formData = new FormData()
    formData.set("name", "X")
    formData.set("email", "bad")
    formData.set("password", "weak")
    formData.set("confirmPassword", "different")

    const result = await registerAction(initialState, formData)

    expect(result.ok).toBe(false)
    expect(result.fieldErrors).toBeDefined()
    expect(authService.register).not.toHaveBeenCalled()
  })

  it("should echo all submitted values when validation fails", async () => {
    const formData = new FormData()
    formData.set("name", "X")
    formData.set("email", "bad")
    formData.set("password", "weak")
    formData.set("confirmPassword", "different")

    const result = await registerAction(initialState, formData)

    expect(result.values).toEqual({
      name: "X",
      email: "bad",
      password: "weak",
      confirmPassword: "different",
    })
  })

  it("should call authService.register with parsed input", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      ok: true,
      accessToken: "stub-token",
    })
    vi.mocked(signIn).mockResolvedValue(undefined as never)

    await registerAction(initialState, validFormData())

    expect(authService.register).toHaveBeenCalledWith({
      name: "Victor Sousa",
      email: "victor@example.com",
      password: "Strong1Pass",
      confirmPassword: "Strong1Pass",
      terms: "on",
    })
  })

  it("should sign in with credentials and redirectTo /home on service success", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      ok: true,
      accessToken: "stub-token",
    })
    vi.mocked(signIn).mockResolvedValue(undefined as never)

    await registerAction(initialState, validFormData())

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "victor@example.com",
      password: "Strong1Pass",
      redirectTo: "/home",
    })
  })

  it("should return error message when service fails", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      ok: false,
      error: "Email already in use",
    })

    const result = await registerAction(initialState, validFormData())

    expect(result.ok).toBe(false)
    expect(result.message).toBe("Email already in use")
    expect(signIn).not.toHaveBeenCalled()
  })

  it("should return an error when register succeeds but signIn throws AuthError", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      ok: true,
      accessToken: "stub-token",
    })
    vi.mocked(signIn).mockRejectedValue(new AuthError("CredentialsSignin"))

    const result = await registerAction(initialState, validFormData())

    expect(result.ok).toBe(false)
    expect(result.message).toContain("não foi possível entrar")
  })

  it("should rethrow non-AuthError exceptions from signIn", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      ok: true,
      accessToken: "stub-token",
    })
    const unexpected = new Error("network down")
    vi.mocked(signIn).mockRejectedValue(unexpected)

    await expect(registerAction(initialState, validFormData())).rejects.toBe(
      unexpected,
    )
  })
})

describe("forgotPasswordAction", () => {
  it("should return field errors when email is invalid", async () => {
    const formData = new FormData()
    formData.set("email", "not-an-email")

    const result = await forgotPasswordAction(initialState, formData)

    expect(result.ok).toBe(false)
    expect(result.fieldErrors).toBeDefined()
    expect(authService.requestPasswordReset).not.toHaveBeenCalled()
  })

  it("should call authService.requestPasswordReset", async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({ ok: true })
    const formData = new FormData()
    formData.set("email", "user@example.com")

    await forgotPasswordAction(initialState, formData)

    expect(authService.requestPasswordReset).toHaveBeenCalledWith({
      email: "user@example.com",
    })
  })

  it("should return ok: true with success message and NOT redirect", async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({ ok: true })
    const formData = new FormData()
    formData.set("email", "user@example.com")

    const result = await forgotPasswordAction(initialState, formData)

    expect(result.ok).toBe(true)
    expect(result.message).toContain("link de recuperação")
    expect(redirect).not.toHaveBeenCalled()
  })

  it("should return ok: false with error message when service fails", async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValue({
      ok: false,
      error: "Service down",
    })
    const formData = new FormData()
    formData.set("email", "user@example.com")

    const result = await forgotPasswordAction(initialState, formData)

    expect(result).toEqual({
      ok: false,
      message: "Service down",
      values: { email: "user@example.com" },
    })
  })
})
