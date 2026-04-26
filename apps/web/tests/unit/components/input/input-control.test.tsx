import { render, screen } from "@testing-library/react"
import { InputControl } from "../../../../app/components/input"

describe("InputControl", () => {
  it("should render an input element", () => {
    render(<InputControl placeholder="email" />)

    expect(screen.getByPlaceholderText("email").tagName).toBe("INPUT")
  })

  it("should apply transparent layout classes", () => {
    render(<InputControl placeholder="x" />)

    const input = screen.getByPlaceholderText("x")
    expect(input.className).toContain("flex-1")
    expect(input.className).toContain("bg-transparent")
    expect(input.className).toContain("outline-none")
    expect(input.className).toContain("placeholder:text-foreground/40")
  })

  it("should forward standard input attributes", () => {
    render(
      <InputControl
        placeholder="x"
        type="email"
        name="email"
        autoComplete="email"
        required
      />,
    )

    const input = screen.getByPlaceholderText("x")
    expect(input).toHaveAttribute("type", "email")
    expect(input).toHaveAttribute("name", "email")
    expect(input).toHaveAttribute("autoComplete", "email")
    expect(input).toBeRequired()
  })

  it("should append custom className", () => {
    render(<InputControl placeholder="x" className="custom-class" />)

    expect(screen.getByPlaceholderText("x").className).toContain("custom-class")
  })
})
