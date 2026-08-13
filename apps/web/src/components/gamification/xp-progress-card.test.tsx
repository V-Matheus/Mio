import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { UserXp } from "@/lib/gamification/types"
import { XpProgressCard } from "./xp-progress-card"

describe("XpProgressCard", () => {
  const mockXp: UserXp = {
    total: 750,
    level: "JUNIOR",
    progressToNext: 25,
    xpToNextLevel: 750,
    rank: 4,
  }

  it("renderiza o card de progresso de XP com rank e nome", () => {
    render(<XpProgressCard xp={mockXp} userName="Victor Matheus" />)

    expect(screen.getByText("Victor Matheus")).toBeInTheDocument()
    expect(screen.getByText("#4 no Ranking")).toBeInTheDocument()
    expect(screen.getAllByText("750 XP").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Faltam/)).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("renderiza mensagem de nível máximo quando xpToNextLevel é 0", () => {
    const maxLevelXp: UserXp = {
      total: 15000,
      level: "ESPECIALISTA",
      progressToNext: 100,
      xpToNextLevel: 0,
      rank: 1,
    }

    render(<XpProgressCard xp={maxLevelXp} />)

    expect(screen.getByText("Nível Máximo Alcançado! 🎉")).toBeInTheDocument()
  })
})
