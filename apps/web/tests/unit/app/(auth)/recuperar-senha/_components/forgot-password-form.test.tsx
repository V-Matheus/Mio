import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { forgotPasswordAction } from "@/app/(auth)/_actions/auth"
import { ForgotPasswordForm } from "@/app/(auth)/recuperar-senha/_components/forgot-password-form"

vi.mock("@/app/(auth)/_actions/auth", () => ({
  forgotPasswordAction: vi.fn(),
}))

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(forgotPasswordAction).mockReset()
    vi.mocked(forgotPasswordAction).mockResolvedValue({ ok: false })
  })

  it("should render the email field", () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("should render the submit button", () => {
    render(<ForgotPasswordForm />)

    expect(
      screen.getByRole("button", { name: /Enviar link/ }),
    ).toBeInTheDocument()
  })

  it("should render link back to login", () => {
    render(<ForgotPasswordForm />)

    expect(
      screen.getByRole("link", { name: /Voltar para o login/ }),
    ).toHaveAttribute("href", "/login")
  })

  it("should call forgotPasswordAction with submitted FormData", async () => {
    render(<ForgotPasswordForm />)

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com")
    await userEvent.click(screen.getByRole("button", { name: /Enviar link/ }))

    expect(forgotPasswordAction).toHaveBeenCalled()
    const [, formData] = vi.mocked(forgotPasswordAction).mock.calls[0] ?? []
    expect((formData as FormData).get("email")).toBe("user@example.com")
  })

  it("should display success message when action returns ok: true", async () => {
    vi.mocked(forgotPasswordAction).mockResolvedValue({
      ok: true,
      message: "Verifique seu email",
    })

    render(<ForgotPasswordForm />)

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com")
    await userEvent.click(screen.getByRole("button", { name: /Enviar link/ }))

    expect(await screen.findByText("Verifique seu email")).toBeInTheDocument()
  })

  it("should display field errors when action returns validation failure", async () => {
    vi.mocked(forgotPasswordAction).mockResolvedValue({
      ok: false,
      fieldErrors: { email: ["Email inválido"] },
    })

    render(<ForgotPasswordForm />)

    await userEvent.type(screen.getByLabelText("Email"), "bad")
    await userEvent.click(screen.getByRole("button", { name: /Enviar link/ }))

    expect(await screen.findByText("Email inválido")).toBeInTheDocument()
  })
})
