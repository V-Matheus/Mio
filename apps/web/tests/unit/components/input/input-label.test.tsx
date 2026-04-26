import { render, screen } from "@testing-library/react"
import { InputLabel } from "../../../../app/components/input"

describe("InputLabel", () => {
  it("should render a label element with htmlFor", () => {
    render(<InputLabel htmlFor="email">Email</InputLabel>)

    const label = screen.getByText("Email")
    expect(label.tagName).toBe("LABEL")
    expect(label).toHaveAttribute("for", "email")
  })

  it("should apply typography classes", () => {
    render(<InputLabel htmlFor="x">Label</InputLabel>)

    const label = screen.getByText("Label")
    expect(label.className).toContain("text-sm")
    expect(label.className).toContain("font-semibold")
    expect(label.className).toContain("text-foreground")
  })

  it("should append custom className", () => {
    render(
      <InputLabel htmlFor="x" className="custom-class">
        Label
      </InputLabel>,
    )

    expect(screen.getByText("Label").className).toContain("custom-class")
  })
})
