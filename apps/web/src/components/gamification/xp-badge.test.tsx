import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { XpBadge } from "./xp-badge"

describe("XpBadge", () => {
  it("renderiza total de XP formatado e nome do nível", () => {
    render(<XpBadge total={1500} level="PLENO" />)

    expect(screen.getByText("1.500 XP")).toBeInTheDocument()
    expect(screen.getByText("Pleno")).toBeInTheDocument()
  })

  it("renderiza variante compacta", () => {
    render(<XpBadge total={250} level="INICIANTE" compact />)

    expect(screen.getByText("250 XP")).toBeInTheDocument()
    expect(screen.queryByText("Iniciante")).not.toBeInTheDocument()
  })
})
