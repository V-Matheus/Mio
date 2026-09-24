import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { resetPasswordAction } from "@/modules/auth/actions"
import { ResetPasswordForm } from "./reset-password-form"

vi.mock("@/modules/auth/actions", () => ({
  resetPasswordAction: vi.fn(),
}))

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(resetPasswordAction).mockReset()
    vi.mocked(resetPasswordAction).mockResolvedValue({ ok: false })
  })

  it("should render password and confirmPassword fields", () => {
    render(<ResetPasswordForm token="test-token" />)

    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirmar nova senha")).toBeInTheDocument()
  })

  it("should render submit button", () => {
    render(<ResetPasswordForm token="test-token" />)

    expect(
      screen.getByRole("button", { name: /Redefinir senha/ }),
    ).toBeInTheDocument()
  })

  it("should render link back to login", () => {
    render(<ResetPasswordForm token="test-token" />)

    expect(
      screen.getByRole("link", { name: /Voltar para o login/ }),
    ).toHaveAttribute("href", "/login")
  })

  it("should submit token along with passwords", async () => {
    render(<ResetPasswordForm token="my-token-123" />)

    await userEvent.type(screen.getByLabelText("Nova senha"), "NewPassword1")
    await userEvent.type(
      screen.getByLabelText("Confirmar nova senha"),
      "NewPassword1",
    )
    await userEvent.click(
      screen.getByRole("button", { name: /Redefinir senha/ }),
    )

    expect(resetPasswordAction).toHaveBeenCalled()
    const [, formData] = vi.mocked(resetPasswordAction).mock.calls[0] ?? []
    expect((formData as FormData).get("token")).toBe("my-token-123")
    expect((formData as FormData).get("password")).toBe("NewPassword1")
    expect((formData as FormData).get("confirmPassword")).toBe("NewPassword1")
  })

  it("should show success state with login button when action succeeds", async () => {
    vi.mocked(resetPasswordAction).mockResolvedValue({
      ok: true,
      message: "Senha alterada com sucesso!",
    })

    render(<ResetPasswordForm token="my-token" />)

    await userEvent.type(screen.getByLabelText("Nova senha"), "NewPassword1")
    await userEvent.type(
      screen.getByLabelText("Confirmar nova senha"),
      "NewPassword1",
    )
    await userEvent.click(
      screen.getByRole("button", { name: /Redefinir senha/ }),
    )

    expect(
      await screen.findByText("Senha alterada com sucesso!"),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Ir para o login/ }),
    ).toBeInTheDocument()
  })

  it("should display field errors when validation fails", async () => {
    vi.mocked(resetPasswordAction).mockResolvedValue({
      ok: false,
      fieldErrors: {
        confirmPassword: ["As senhas não conferem"],
      },
    })

    render(<ResetPasswordForm token="my-token" />)

    await userEvent.type(screen.getByLabelText("Nova senha"), "NewPassword1")
    await userEvent.type(
      screen.getByLabelText("Confirmar nova senha"),
      "Different1",
    )
    await userEvent.click(
      screen.getByRole("button", { name: /Redefinir senha/ }),
    )

    expect(
      await screen.findByText("As senhas não conferem"),
    ).toBeInTheDocument()
  })
})
