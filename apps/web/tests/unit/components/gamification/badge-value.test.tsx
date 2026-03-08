import { render, screen } from "@testing-library/react"
import { BadgeValue } from "../../../../app/components/gamification"

describe("BadgeValue", () => {
  it("should render a span element", () => {
    render(<BadgeValue data-testid="value">12</BadgeValue>)

    expect(screen.getByTestId("value").tagName).toBe("SPAN")
  })

  it("should render children content", () => {
    render(<BadgeValue>450</BadgeValue>)

    expect(screen.getByText("450")).toBeInTheDocument()
  })

  it("should apply text styles", () => {
    render(<BadgeValue data-testid="value">12</BadgeValue>)

    const span = screen.getByTestId("value")
    expect(span.className).toContain("text-sm")
    expect(span.className).toContain("font-bold")
    expect(span.className).toContain("font-display")
    expect(span.className).toContain("text-foreground")
  })

  it("should append custom className", () => {
    render(
      <BadgeValue className="text-primary" data-testid="value">
        12
      </BadgeValue>,
    )

    expect(screen.getByTestId("value").className).toContain("text-primary")
  })

  it("should forward additional props", () => {
    render(<BadgeValue aria-label="xp count">450</BadgeValue>)

    expect(screen.getByLabelText("xp count")).toBeInTheDocument()
  })
})
