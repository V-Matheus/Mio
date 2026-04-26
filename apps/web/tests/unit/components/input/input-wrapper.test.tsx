import { render, screen } from "@testing-library/react"
import { InputWrapper } from "../../../../app/components/input"

describe("InputWrapper", () => {
  it("should render a div containing children", () => {
    render(
      <InputWrapper data-testid="wrapper">
        <span>Inside</span>
      </InputWrapper>,
    )

    const wrapper = screen.getByTestId("wrapper")
    expect(wrapper.tagName).toBe("DIV")
    expect(wrapper).toHaveTextContent("Inside")
  })

  it("should apply base layout classes", () => {
    render(<InputWrapper data-testid="wrapper">x</InputWrapper>)

    const wrapper = screen.getByTestId("wrapper")
    expect(wrapper.className).toContain("flex")
    expect(wrapper.className).toContain("flex-col")
    expect(wrapper.className).toContain("gap-2")
  })

  it("should append custom className", () => {
    render(
      <InputWrapper data-testid="wrapper" className="custom-class">
        x
      </InputWrapper>,
    )

    expect(screen.getByTestId("wrapper").className).toContain("custom-class")
  })

  it("should forward additional props", () => {
    render(
      <InputWrapper data-testid="wrapper" aria-label="test">
        x
      </InputWrapper>,
    )

    expect(screen.getByTestId("wrapper")).toHaveAttribute("aria-label", "test")
  })
})
