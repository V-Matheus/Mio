import { render, screen } from "@testing-library/react"
import { CardWrapper } from "../../../../app/components/card"

describe("CardWrapper", () => {
  it("should render a div element", () => {
    render(<CardWrapper data-testid="card">Content</CardWrapper>)

    expect(screen.getByTestId("card").tagName).toBe("DIV")
  })

  it("should render children content", () => {
    render(<CardWrapper>Card content</CardWrapper>)

    expect(screen.getByText("Card content")).toBeInTheDocument()
  })

  it("should apply default variant styles by default", () => {
    render(<CardWrapper data-testid="card">Content</CardWrapper>)

    const card = screen.getByTestId("card")
    expect(card.className).toContain("bg-white")
    expect(card.className).toContain("shadow-sm")
    expect(card.className).toContain("rounded-2xl")
  })

  it("should apply reward variant styles", () => {
    render(
      <CardWrapper variant="reward" data-testid="card">
        Reward
      </CardWrapper>,
    )

    const card = screen.getByTestId("card")
    expect(card.className).toContain("bg-white")
    expect(card.className).toContain("flex")
    expect(card.className).toContain("items-center")
    expect(card.className).toContain("gap-4")
  })

  it("should apply active variant styles", () => {
    render(
      <CardWrapper variant="active" data-testid="card">
        Active
      </CardWrapper>,
    )

    const card = screen.getByTestId("card")
    expect(card.className).toContain("bg-background")
    expect(card.className).toContain("border-primary")
    expect(card.className).toContain("border-2")
  })

  it("should forward additional props to the div element", () => {
    render(<CardWrapper aria-label="test card">Content</CardWrapper>)

    expect(screen.getByLabelText("test card")).toBeInTheDocument()
  })

  it("should append custom className", () => {
    render(
      <CardWrapper className="my-custom-class" data-testid="card">
        Content
      </CardWrapper>,
    )

    const card = screen.getByTestId("card")
    expect(card.className).toContain("my-custom-class")
  })
})
