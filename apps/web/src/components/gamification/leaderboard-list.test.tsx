import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { LeaderboardEntry } from "@/lib/gamification/types"
import { LeaderboardList } from "./leaderboard-list"

describe("LeaderboardList", () => {
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
      userCode: "u4",
      name: "Diego Lima",
      avatarUrl: null,
      total: 500,
      rank: 4,
      level: "JUNIOR",
    },
  ]

  it("renderiza lista com medalhas e posições", () => {
    render(<LeaderboardList entries={mockEntries} currentUserCode="u2" />)

    expect(screen.getByText("Ana Silva")).toBeInTheDocument()
    expect(screen.getByText("Carlos Eduardo")).toBeInTheDocument()
    expect(screen.getByText("Diego Lima")).toBeInTheDocument()
    expect(screen.getByText("#4")).toBeInTheDocument()
    expect(screen.getByText("Você")).toBeInTheDocument()
  })

  it("renderiza estado vazio quando não há alunos", () => {
    render(<LeaderboardList entries={[]} />)

    expect(
      screen.getByText("Nenhum aluno no ranking ainda"),
    ).toBeInTheDocument()
  })
})
