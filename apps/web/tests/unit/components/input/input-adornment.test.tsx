import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { InputAdornment } from "../../../../app/components/input"

describe("InputAdornment", () => {
  it("should render a button element with aria-label", () => {
    render(<InputAdornment aria-label="Toggle password">x</InputAdornment>)

    const button = screen.getByRole("button", { name: "Toggle password" })
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe("BUTTON")
  })

  it("should default to type='button' to avoid form submission", () => {
    render(<InputAdornment aria-label="Action">x</InputAdornment>)

    expect(screen.getByRole("button")).toHaveAttribute("type", "button")
  })

  it("should accept a custom type when provided", () => {
    render(
      <InputAdornment aria-label="Submit" type="submit">
        x
      </InputAdornment>,
    )

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit")
  })

  it("should apply visual classes", () => {
    render(<InputAdornment aria-label="x">x</InputAdornment>)

    const button = screen.getByRole("button")
    expect(button.className).toContain("inline-flex")
    expect(button.className).toContain("cursor-pointer")
    expect(button.className).toContain("text-foreground/40")
  })

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn()
    render(
      <InputAdornment aria-label="Action" onClick={handleClick}>
        x
      </InputAdornment>,
    )

    await userEvent.click(screen.getByRole("button"))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("should append custom className", () => {
    render(
      <InputAdornment aria-label="x" className="custom-class">
        x
      </InputAdornment>,
    )

    expect(screen.getByRole("button").className).toContain("custom-class")
  })
})
