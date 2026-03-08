import { render, screen } from "@testing-library/react"
import { ProgressBar } from "../../../../app/components/gamification"

describe("ProgressBar", () => {
  it("should render a progressbar element", () => {
    render(<ProgressBar value={50} />)

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("should set aria attributes", () => {
    render(<ProgressBar value={30} max={200} />)

    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuenow", "30")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "200")
  })

  it("should calculate percentage width correctly", () => {
    render(<ProgressBar value={75} />)

    const bar = screen.getByRole("progressbar")
    const fill = bar.firstChild as HTMLElement
    expect(fill.style.width).toBe("75%")
  })

  it("should clamp value to 0% minimum", () => {
    render(<ProgressBar value={-10} />)

    const bar = screen.getByRole("progressbar")
    const fill = bar.firstChild as HTMLElement
    expect(fill.style.width).toBe("0%")
  })

  it("should clamp value to 100% maximum", () => {
    render(<ProgressBar value={150} />)

    const bar = screen.getByRole("progressbar")
    const fill = bar.firstChild as HTMLElement
    expect(fill.style.width).toBe("100%")
  })

  it("should apply base styles", () => {
    render(<ProgressBar value={50} data-testid="bar" />)

    const bar = screen.getByTestId("bar")
    expect(bar.className).toContain("h-4")
    expect(bar.className).toContain("rounded-full")
    expect(bar.className).toContain("bg-gray-200")
  })

  it("should apply fill styles", () => {
    render(<ProgressBar value={50} />)

    const bar = screen.getByRole("progressbar")
    const fill = bar.firstChild as HTMLElement
    expect(fill.className).toContain("bg-primary")
    expect(fill.className).toContain("rounded-full")
  })

  it("should append custom className", () => {
    render(<ProgressBar value={50} className="w-64" data-testid="bar" />)

    expect(screen.getByTestId("bar").className).toContain("w-64")
  })

  it("should use custom max value", () => {
    render(<ProgressBar value={50} max={200} />)

    const bar = screen.getByRole("progressbar")
    const fill = bar.firstChild as HTMLElement
    expect(fill.style.width).toBe("25%")
  })
})
