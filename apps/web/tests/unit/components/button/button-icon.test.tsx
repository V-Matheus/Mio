import { render, screen } from "@testing-library/react"
import { ButtonIcon } from "../../../../app/components/button"

describe("ButtonIcon", () => {
  it("should render a span element", () => {
    render(<ButtonIcon data-testid="icon">X</ButtonIcon>)

    expect(screen.getByTestId("icon").tagName).toBe("SPAN")
  })

  it("should render children content", () => {
    render(<ButtonIcon>X</ButtonIcon>)

    expect(screen.getByText("X")).toBeInTheDocument()
  })

  it("should apply default size of 24", () => {
    render(<ButtonIcon data-testid="icon">X</ButtonIcon>)

    const span = screen.getByTestId("icon")
    expect(span.style.width).toBe("24px")
    expect(span.style.height).toBe("24px")
  })

  it("should apply custom size", () => {
    render(
      <ButtonIcon size={32} data-testid="icon">
        X
      </ButtonIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.style.width).toBe("32px")
    expect(span.style.height).toBe("32px")
  })

  it("should apply layout styles", () => {
    render(<ButtonIcon data-testid="icon">X</ButtonIcon>)

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("inline-flex")
    expect(span.className).toContain("items-center")
    expect(span.className).toContain("justify-center")
  })

  it("should append custom className", () => {
    render(
      <ButtonIcon className="text-red-500" data-testid="icon">
        X
      </ButtonIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("text-red-500")
  })
})
