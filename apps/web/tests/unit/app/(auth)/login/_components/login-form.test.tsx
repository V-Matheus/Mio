import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { loginAction } from "@/app/(auth)/_actions/auth"
import { LoginForm } from "@/app/(auth)/login/_components/login-form"

vi.mock("@/app/(auth)/_actions/auth", () => ({
  loginAction: vi.fn(),
  signInWithProvider: vi.fn(),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(loginAction).mockReset()
    vi.mocked(loginAction).mockResolvedValue({ ok: false })
  })

  it("should render email and password fields", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
  })

  it("should render submit button", () => {
    render(<LoginForm />)

    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument()
  })

  it("should render forgot password link", () => {
    render(<LoginForm />)

    expect(screen.getByRole("link", { name: /Esqueceu/ })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    )
  })

  it("should render link to register page", () => {
    render(<LoginForm />)

    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute(
      "href",
      "/cadastro",
    )
  })

  it("should render social login buttons", () => {
    render(<LoginForm />)

    expect(screen.getByRole("button", { name: /Google/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /GitHub/ })).toBeInTheDocument()
  })

  it("should toggle password visibility", async () => {
    render(<LoginForm />)
    const password = screen.getByLabelText("Senha")

    expect(password).toHaveAttribute("type", "password")

    await userEvent.click(screen.getByRole("button", { name: "Mostrar senha" }))
    expect(password).toHaveAttribute("type", "text")

    await userEvent.click(screen.getByRole("button", { name: "Ocultar senha" }))
    expect(password).toHaveAttribute("type", "password")
  })

  it("should call loginAction with submitted FormData", async () => {
    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com")
    await userEvent.type(screen.getByLabelText("Senha"), "secret")
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }))

    expect(loginAction).toHaveBeenCalled()
    const [, formData] = vi.mocked(loginAction).mock.calls[0] ?? []
    expect((formData as FormData).get("email")).toBe("user@example.com")
    expect((formData as FormData).get("password")).toBe("secret")
  })

  it("should display field errors returned by the action", async () => {
    vi.mocked(loginAction).mockResolvedValue({
      ok: false,
      fieldErrors: { email: ["Email inválido"] },
    })

    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText("Email"), "bad")
    await userEvent.type(screen.getByLabelText("Senha"), "x")
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }))

    expect(await screen.findByText("Email inválido")).toBeInTheDocument()
  })

  it("should display global error banner from action message", async () => {
    vi.mocked(loginAction).mockResolvedValue({
      ok: false,
      message: "Email ou senha inválidos",
    })

    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com")
    await userEvent.type(screen.getByLabelText("Senha"), "wrong")
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }))

    expect(
      await screen.findByText("Email ou senha inválidos"),
    ).toBeInTheDocument()
  })
})
