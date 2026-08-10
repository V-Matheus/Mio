import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { LeaderboardEntry } from "@/lib/gamification/types"
import { LeaderboardPodium } from "./leaderboard-podium"

describe("LeaderboardPodium", () => {
  const mockEntries: LeaderboardEntry[] = [
    {
      userCode: "u1",
      name: "Ana Silva",
      avatarUrl: "https://avatar1.png",
      total: 3000,
      rank: 1,
      level: "PLENO",
    },
    {
      userCode: "u2",
      name: "Carlos Eduardo",
      avatarUrl: null,
      total: 2000,
      rank: 2,
      level: "PLENO",
    },
    {
      userCode: "u3",
      name: "Beatriz Costa",
      avatarUrl: null,
      total: 1000,
      rank: 3,
      level: "JUNIOR",
    },
  ]

  it("renderiza os 3 primeiros colocados com nomes e títulos de pódio", () => {
    render(<LeaderboardPodium entries={mockEntries} />)

    expect(screen.getByText("Ana Silva")).toBeInTheDocument()
    expect(screen.getByText("Campeão Global")).toBeInTheDocument()
    expect(screen.getByText("Carlos Eduardo")).toBeInTheDocument()
    expect(screen.getByText("2º Lugar")).toBeInTheDocument()
    expect(screen.getByText("Beatriz Costa")).toBeInTheDocument()
    expect(screen.getByText("3º Lugar")).toBeInTheDocument()
  })

  it("não renderiza nada se lista for vazia", () => {
    const { container } = render(<LeaderboardPodium entries={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
