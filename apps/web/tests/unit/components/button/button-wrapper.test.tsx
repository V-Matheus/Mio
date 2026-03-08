import { render, screen } from "@testing-library/react"
import { ButtonWrapper } from "../../../../app/components/button"

describe("ButtonWrapper", () => {
  it("should render a button element", () => {
    render(<ButtonWrapper>Click me</ButtonWrapper>)

    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("should render children content", () => {
    render(<ButtonWrapper>Click me</ButtonWrapper>)

    expect(screen.getByRole("button")).toHaveTextContent("Click me")
  })

  it("should apply primary variant styles by default", () => {
    render(<ButtonWrapper>Primary</ButtonWrapper>)

    const button = screen.getByRole("button")
    expect(button.className).toContain("bg-primary")
    expect(button.className).toContain("text-white")
    expect(button.className).toContain("rounded-full")
  })

  it("should apply secondary variant styles", () => {
    render(<ButtonWrapper variant="secondary">Secondary</ButtonWrapper>)

    const button = screen.getByRole("button")
    expect(button.className).toContain("bg-white")
    expect(button.className).toContain("text-foreground")
    expect(button.className).toContain("border-foreground")
  })

  it("should apply icon variant styles", () => {
    render(
      <ButtonWrapper variant="icon" aria-label="Icon">
        Icon
      </ButtonWrapper>,
    )

    const button = screen.getByRole("button")
    expect(button.className).toContain("rounded-2xl")
  })

  it("should apply colorScheme for icon variant", () => {
    render(
      <ButtonWrapper variant="icon" colorScheme="success" aria-label="Success">
        Icon
      </ButtonWrapper>,
    )

    const button = screen.getByRole("button")
    expect(button.className).toContain("bg-success")
    expect(button.className).toContain("text-white")
  })

  it("should apply disabled colorScheme styles for icon variant", () => {
    render(
      <ButtonWrapper
        variant="icon"
        colorScheme="disabled"
        aria-label="Disabled"
      >
        Icon
      </ButtonWrapper>,
    )

    const button = screen.getByRole("button")
    expect(button.className).toContain("bg-disabled")
    expect(button.className).toContain("text-disabled-foreground")
    expect(button.className).toContain("cursor-not-allowed")
  })

  it("should automatically set disabled when colorScheme is disabled", () => {
    render(
      <ButtonWrapper
        variant="icon"
        colorScheme="disabled"
        aria-label="Disabled"
      >
        Icon
      </ButtonWrapper>,
    )

    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("should not apply iconColorStyles for non-icon variants", () => {
    render(
      <ButtonWrapper variant="primary" colorScheme="success">
        Primary
      </ButtonWrapper>,
    )

    const button = screen.getByRole("button")
    expect(button.className).not.toContain("bg-success")
  })

  it("should disable primary variant with disabled prop", () => {
    render(<ButtonWrapper disabled>Primary</ButtonWrapper>)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button.className).toContain("disabled:opacity-50")
    expect(button.className).toContain("disabled:cursor-not-allowed")
  })

  it("should disable secondary variant with disabled prop", () => {
    render(
      <ButtonWrapper variant="secondary" disabled>
        Secondary
      </ButtonWrapper>,
    )

    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("should forward additional props to the button element", () => {
    render(<ButtonWrapper aria-label="test button">Click</ButtonWrapper>)

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "test button",
    )
  })

  it("should append custom className", () => {
    render(<ButtonWrapper className="my-custom-class">Click</ButtonWrapper>)

    const button = screen.getByRole("button")
    expect(button.className).toContain("my-custom-class")
  })
})
