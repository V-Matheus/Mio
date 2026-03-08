import { render, screen } from "@testing-library/react"
import { CardDescription } from "../../../../app/components/card"

describe("CardDescription", () => {
  it("should render a span element", () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)

    expect(screen.getByTestId("desc").tagName).toBe("SPAN")
  })

  it("should render children content", () => {
    render(<CardDescription>+50 XP</CardDescription>)

    expect(screen.getByText("+50 XP")).toBeInTheDocument()
  })

  it("should apply text styles", () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)

    const span = screen.getByTestId("desc")
    expect(span.className).toContain("text-lg")
    expect(span.className).toContain("font-bold")
    expect(span.className).toContain("font-display")
    expect(span.className).toContain("text-foreground")
  })

  it("should append custom className", () => {
    render(
      <CardDescription className="text-primary" data-testid="desc">
        +50 XP
      </CardDescription>,
    )

    const span = screen.getByTestId("desc")
    expect(span.className).toContain("text-primary")
  })

  it("should forward additional props", () => {
    render(<CardDescription aria-label="reward value">+50 XP</CardDescription>)

    expect(screen.getByLabelText("reward value")).toBeInTheDocument()
  })
})
