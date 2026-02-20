import { render, screen } from "@testing-library/react"
import Home from "../../app/page"

describe("Home", () => {
  it("should render the title", () => {
    render(<Home />)

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mio")
  })
})
