import { render, screen } from "@testing-library/react"
import { InputField } from "../../../../app/components/input"

describe("InputField", () => {
  it("should render a div containing children", () => {
    render(
      <InputField data-testid="field">
        <input />
      </InputField>,
    )

    const field = screen.getByTestId("field")
    expect(field.tagName).toBe("DIV")
    expect(field.querySelector("input")).toBeInTheDocument()
  })

  it("should apply base structural styles", () => {
    render(<InputField data-testid="field">x</InputField>)

    const field = screen.getByTestId("field")
    expect(field.className).toContain("flex")
    expect(field.className).toContain("rounded-full")
    expect(field.className).toContain("border-2")
    expect(field.className).toContain("bg-white")
  })

  it("should default to primary colorScheme", () => {
    render(<InputField data-testid="field">x</InputField>)

    const field = screen.getByTestId("field")
    expect(field.className).toContain("border-foreground/10")
    expect(field.className).toContain("[--field-color:var(--color-primary)]")
  })

  it("should apply success colorScheme classes", () => {
    render(
      <InputField data-testid="field" colorScheme="success">
        x
      </InputField>,
    )

    const field = screen.getByTestId("field")
    expect(field.className).toContain("border-success/40")
    expect(field.className).toContain("[--field-color:var(--color-success)]")
  })

  it("should apply disabled colorScheme classes", () => {
    render(
      <InputField data-testid="field" colorScheme="disabled">
        x
      </InputField>,
    )

    const field = screen.getByTestId("field")
    expect(field.className).toContain("border-disabled")
    expect(field.className).toContain("cursor-not-allowed")
    expect(field.className).toContain("pointer-events-none")
  })

  it("should append custom className", () => {
    render(
      <InputField data-testid="field" className="custom-class">
        x
      </InputField>,
    )

    expect(screen.getByTestId("field").className).toContain("custom-class")
  })
})
