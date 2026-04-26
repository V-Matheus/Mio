import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { registerAction } from "@/app/(auth)/_actions/auth"
import { RegisterForm } from "@/app/(auth)/cadastro/_components/register-form"

vi.mock("@/app/(auth)/_actions/auth", () => ({
  registerAction: vi.fn(),
  signInWithProvider: vi.fn(),
}))

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.mocked(registerAction).mockReset()
    vi.mocked(registerAction).mockResolvedValue({ ok: false })
  })

  it("should render all form fields", () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirmar senha")).toBeInTheDocument()
  })

  it("should render terms checkbox", () => {
    const { container } = render(<RegisterForm />)

    const checkbox = container.querySelector<HTMLInputElement>(
      "input[type='checkbox'][name='terms']",
    )
    expect(checkbox).not.toBeNull()
    expect(checkbox).not.toBeChecked()
  })

  it("should render submit button", () => {
    render(<RegisterForm />)

    expect(
      screen.getByRole("button", { name: "Cadastrar" }),
    ).toBeInTheDocument()
  })

  it("should render link to login page", () => {
    render(<RegisterForm />)

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login",
    )
  })

  it("should render social login buttons", () => {
    render(<RegisterForm />)

    expect(screen.getByRole("button", { name: /Google/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /GitHub/ })).toBeInTheDocument()
  })

  it("should toggle password visibility independently for both password fields", async () => {
    render(<RegisterForm />)
    const password = screen.getByLabelText("Senha")
    const confirmPassword = screen.getByLabelText("Confirmar senha")

    const [firstToggle] = screen.getAllByRole("button", {
      name: "Mostrar senha",
    })
    if (!firstToggle) throw new Error("expected toggle button to exist")

    await userEvent.click(firstToggle)
    expect(password).toHaveAttribute("type", "text")
    expect(confirmPassword).toHaveAttribute("type", "password")
  })

  it("should call registerAction with submitted FormData", async () => {
    render(<RegisterForm />)

    await userEvent.type(screen.getByLabelText("Nome completo"), "Victor")
    await userEvent.type(screen.getByLabelText("Email"), "victor@example.com")
    await userEvent.type(screen.getByLabelText("Senha"), "Strong1Pass")
    await userEvent.type(
      screen.getByLabelText("Confirmar senha"),
      "Strong1Pass",
    )
    await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }))

    expect(registerAction).toHaveBeenCalled()
    const [, formData] = vi.mocked(registerAction).mock.calls[0] ?? []
    expect((formData as FormData).get("name")).toBe("Victor")
    expect((formData as FormData).get("email")).toBe("victor@example.com")
  })

  it("should display field errors returned by the action", async () => {
    vi.mocked(registerAction).mockResolvedValue({
      ok: false,
      fieldErrors: { confirmPassword: ["As senhas não conferem"] },
    })

    render(<RegisterForm />)

    await userEvent.type(screen.getByLabelText("Nome completo"), "X")
    await userEvent.click(screen.getByRole("button", { name: "Cadastrar" }))

    expect(
      await screen.findByText("As senhas não conferem"),
    ).toBeInTheDocument()
  })
})
