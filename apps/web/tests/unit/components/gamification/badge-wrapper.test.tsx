import { render, screen } from "@testing-library/react"
import { BadgeWrapper } from "../../../../app/components/gamification"

describe("BadgeWrapper", () => {
  it("should render a div element", () => {
    render(<BadgeWrapper data-testid="badge">Content</BadgeWrapper>)

    expect(screen.getByTestId("badge").tagName).toBe("DIV")
  })

  it("should render children content", () => {
    render(<BadgeWrapper>12</BadgeWrapper>)

    expect(screen.getByText("12")).toBeInTheDocument()
  })

  it("should apply base styles", () => {
    render(<BadgeWrapper data-testid="badge">Content</BadgeWrapper>)

    const badge = screen.getByTestId("badge")
    expect(badge.className).toContain("inline-flex")
    expect(badge.className).toContain("items-center")
    expect(badge.className).toContain("gap-2")
    expect(badge.className).toContain("rounded-full")
    expect(badge.className).toContain("bg-white")
    expect(badge.className).toContain("border")
  })

  it("should append custom className", () => {
    render(
      <BadgeWrapper className="my-class" data-testid="badge">
        Content
      </BadgeWrapper>,
    )

    expect(screen.getByTestId("badge").className).toContain("my-class")
  })

  it("should forward additional props", () => {
    render(<BadgeWrapper aria-label="streak badge">12</BadgeWrapper>)

    expect(screen.getByLabelText("streak badge")).toBeInTheDocument()
  })
})
