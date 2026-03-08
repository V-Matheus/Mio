import { render, screen } from "@testing-library/react"
import { CardIcon } from "../../../../app/components/card"

describe("CardIcon", () => {
  it("should render a span element", () => {
    render(<CardIcon data-testid="icon">X</CardIcon>)

    expect(screen.getByTestId("icon").tagName).toBe("SPAN")
  })

  it("should render children content", () => {
    render(<CardIcon>X</CardIcon>)

    expect(screen.getByText("X")).toBeInTheDocument()
  })

  it("should apply default size of 40", () => {
    render(<CardIcon data-testid="icon">X</CardIcon>)

    const span = screen.getByTestId("icon")
    expect(span.style.width).toBe("40px")
    expect(span.style.height).toBe("40px")
  })

  it("should apply custom size", () => {
    render(
      <CardIcon size={56} data-testid="icon">
        X
      </CardIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.style.width).toBe("56px")
    expect(span.style.height).toBe("56px")
  })

  it("should apply primary colorScheme by default", () => {
    render(<CardIcon data-testid="icon">X</CardIcon>)

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("bg-primary/10")
    expect(span.className).toContain("text-primary")
  })

  it("should apply success colorScheme", () => {
    render(
      <CardIcon colorScheme="success" data-testid="icon">
        X
      </CardIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("bg-success/10")
    expect(span.className).toContain("text-success")
  })

  it("should apply primary-solid colorScheme", () => {
    render(
      <CardIcon colorScheme="primary-solid" data-testid="icon">
        X
      </CardIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("bg-primary")
    expect(span.className).toContain("text-white")
    expect(span.className).toContain("rounded-full")
  })

  it("should apply secondary colorScheme", () => {
    render(
      <CardIcon colorScheme="secondary" data-testid="icon">
        X
      </CardIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("bg-secondary/10")
    expect(span.className).toContain("text-secondary")
  })

  it("should apply layout styles", () => {
    render(<CardIcon data-testid="icon">X</CardIcon>)

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("inline-flex")
    expect(span.className).toContain("items-center")
    expect(span.className).toContain("justify-center")
  })

  it("should append custom className", () => {
    render(
      <CardIcon className="text-red-500" data-testid="icon">
        X
      </CardIcon>,
    )

    const span = screen.getByTestId("icon")
    expect(span.className).toContain("text-red-500")
  })
})
