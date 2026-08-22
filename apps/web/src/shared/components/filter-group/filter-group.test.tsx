import { fireEvent, render, screen } from "@testing-library/react"
import { vi } from "vitest"
import {
  FilterGroup,
  FilterGroupItem,
  FilterGroupLabel,
  FilterGroupList,
  FilterGroupWrapper,
} from "@/shared/components/filter-group"

describe("FilterGroup Compound Components", () => {
  it("should render FilterGroupWrapper with data-slot", () => {
    render(<FilterGroupWrapper data-testid="wrapper">Test</FilterGroupWrapper>)
    const wrapper = screen.getByTestId("wrapper")
    expect(wrapper.tagName).toBe("DIV")
    expect(wrapper.getAttribute("data-slot")).toBe("filter-group")
  })

  it("should render FilterGroupLabel with data-slot", () => {
    render(<FilterGroupLabel data-testid="label">Categoria</FilterGroupLabel>)
    const label = screen.getByTestId("label")
    expect(label.tagName).toBe("SPAN")
    expect(label.getAttribute("data-slot")).toBe("filter-group-label")
    expect(screen.getByText("Categoria")).toBeInTheDocument()
  })

  it("should render FilterGroupList with data-slot", () => {
    render(<FilterGroupList data-testid="list">Items</FilterGroupList>)
    const list = screen.getByTestId("list")
    expect(list.tagName).toBe("DIV")
    expect(list.getAttribute("data-slot")).toBe("filter-group-list")
  })

  it("should render FilterGroupItem with selected state and data-slot", () => {
    render(
      <FilterGroupItem selected data-testid="item">
        Front-End
      </FilterGroupItem>,
    )
    const item = screen.getByTestId("item")
    expect(item.tagName).toBe("BUTTON")
    expect(item.getAttribute("data-slot")).toBe("filter-group-item")
    expect(item.getAttribute("data-selected")).toBe("")
    expect(item.className).toContain("bg-primary")
  })

  it("should composition FilterGroup render label and items correctly", () => {
    const handleSelect = vi.fn()
    render(
      <FilterGroup
        label="Nível"
        items={["Todos", "Iniciante", "Avançado"]}
        selectedItem="Iniciante"
        onSelect={handleSelect}
      />,
    )

    expect(screen.getByText("Nível")).toBeInTheDocument()
    expect(screen.getByText("Todos")).toBeInTheDocument()
    const activeItem = screen.getByText("Iniciante")
    expect(activeItem.getAttribute("data-selected")).toBe("")

    fireEvent.click(screen.getByText("Avançado"))
    expect(handleSelect).toHaveBeenCalledWith("Avançado")
  })
})
