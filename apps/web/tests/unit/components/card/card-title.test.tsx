import { render, screen } from "@testing-library/react"
import { CardTitle } from "../../../../app/components/card"

describe("CardTitle", () => {
  it("should render a span element", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)

    expect(screen.getByTestId("title").tagName).toBe("SPAN")
  })

  it("should render children content", () => {
    render(<CardTitle>Reward Card</CardTitle>)

    expect(screen.getByText("Reward Card")).toBeInTheDocument()
  })

  it("should apply text styles", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)

    const span = screen.getByTestId("title")
    expect(span.className).toContain("text-sm")
    expect(span.className).toContain("font-semibold")
    expect(span.className).toContain("text-foreground")
  })

  it("should append custom className", () => {
    render(
      <CardTitle className="text-red-500" data-testid="title">
        Title
      </CardTitle>,
    )

    const span = screen.getByTestId("title")
    expect(span.className).toContain("text-red-500")
  })

  it("should forward additional props", () => {
    render(<CardTitle aria-label="card title">Title</CardTitle>)

    expect(screen.getByLabelText("card title")).toBeInTheDocument()
  })
})
