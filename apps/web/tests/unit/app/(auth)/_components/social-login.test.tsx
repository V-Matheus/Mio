import { render, screen } from "@testing-library/react"
import { SocialLogin } from "@/app/(auth)/_components/social-login"

vi.mock("@/app/(auth)/_actions/auth", () => ({
  signInWithProvider: vi.fn(),
}))

describe("SocialLogin", () => {
  it("should render Google and GitHub buttons", () => {
    render(<SocialLogin />)

    expect(screen.getByRole("button", { name: /Google/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /GitHub/ })).toBeInTheDocument()
  })

  it("should render in a 2-column grid", () => {
    const { container } = render(<SocialLogin />)

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain("grid")
    expect(grid.className).toContain("grid-cols-2")
  })

  it("should include hidden inputs with provider names", () => {
    const { container } = render(<SocialLogin />)

    const hiddens = container.querySelectorAll<HTMLInputElement>(
      "input[type='hidden'][name='provider']",
    )

    expect(hiddens).toHaveLength(2)
    expect(hiddens[0]?.value).toBe("google")
    expect(hiddens[1]?.value).toBe("github")
  })

  it("should render each button as type='submit' inside a form", () => {
    const { container } = render(<SocialLogin />)

    const forms = container.querySelectorAll("form")
    expect(forms).toHaveLength(2)

    const submitButtons = container.querySelectorAll("button[type='submit']")
    expect(submitButtons).toHaveLength(2)
  })
})
