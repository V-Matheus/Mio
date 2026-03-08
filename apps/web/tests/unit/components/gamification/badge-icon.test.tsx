import { render, screen } from "@testing-library/react"
import { BadgeIcon } from "../../../../app/components/gamification"

describe("BadgeIcon", () => {
  it("should render a span element", () => {
    render(<BadgeIcon data-testid="icon">X</BadgeIcon>)

    expect(screen.getByTestId("icon").tagName).toBe("SPAN")
  })

  it("should render children content", () => {
    render(<BadgeIcon>X</BadgeIcon>)

    expect(screen.getByText("X")).toBeInTheDocument()
  })

  it("should apply default size of 20", () => {
    render(<BadgeIcon data-testid="icon">X</BadgeIcon>)

    const span = screen.getByTestId("icon")
    expect(span.style.width).toBe("20px")
    expect(span.style.height).toBe("20px")
  })

  it("should apply custom size", () => {
    render(
      <BadgeIcon size={16} data-testid="icon">
        X
      </BadgeIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.style.width).toBe("16px")
    expect(span.style.height).toBe("16px")
  })

  it("should apply layout styles", () => {
    render(<BadgeIcon data-testid="icon">X</BadgeIcon>)

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("inline-flex")
    expect(span.className).toContain("items-center")
    expect(span.className).toContain("justify-center")
  })

  it("should append custom className", () => {
    render(
      <BadgeIcon className="text-red-500" data-testid="icon">
        X
      </BadgeIcon>,
    )

    expect(screen.getByTestId("icon").className).toContain("text-red-500")
  })
})
