import { render, screen } from "@testing-library/react"
import { ButtonText } from "../../../../app/components/button"

describe("ButtonText", () => {
  it("should render a span element", () => {
    render(<ButtonText>Hello</ButtonText>)

    expect(screen.getByText("Hello").tagName).toBe("SPAN")
  })

  it("should render children content", () => {
    render(<ButtonText>Primary Action</ButtonText>)

    expect(screen.getByText("Primary Action")).toBeInTheDocument()
  })

  it("should apply text styles", () => {
    render(<ButtonText>Text</ButtonText>)

    const span = screen.getByText("Text")
    expect(span.className).toContain("text-xl")
    expect(span.className).toContain("leading-none")
  })

  it("should append custom className", () => {
    render(<ButtonText className="text-2xl">Text</ButtonText>)

    const span = screen.getByText("Text")
    expect(span.className).toContain("text-2xl")
  })

  it("should forward additional props", () => {
    render(<ButtonText data-testid="btn-text">Text</ButtonText>)

    expect(screen.getByTestId("btn-text")).toBeInTheDocument()
  })
})
