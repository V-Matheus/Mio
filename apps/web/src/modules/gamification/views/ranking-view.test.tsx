import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RankingView } from "./ranking-view"

vi.mock("@/modules/auth/utils/getSessionUser", () => ({
  getSessionUser: vi.fn().mockResolvedValue({
    id: "u123",
    name: "Victor Matheus",
    email: "victor@example.com",
    roles: ["STUDENT"],
  }),
}))

vi.mock("../queries", () => ({
  getMyXpQuery: vi.fn().mockResolvedValue({
    total: 1250,
    level: "JUNIOR",
    progressToNext: 25,
    xpToNextLevel: 250,
    rank: 2,
  }),
  getLeaderboardQuery: vi.fn().mockResolvedValue([
    {
      userCode: "u1",
      name: "Ana Silva",
      avatarUrl: null,
      total: 3000,
      rank: 1,
      level: "PLENO",
    },
    {
      userCode: "u123",
      name: "Victor Matheus",
      avatarUrl: null,
      total: 1250,
      rank: 2,
      level: "JUNIOR",
    },
    {
      userCode: "u3",
      name: "Beatriz Costa",
      avatarUrl: null,
      total: 800,
      rank: 3,
      level: "JUNIOR",
    },
    {
      userCode: "u4",
      name: "Carlos Eduardo",
      avatarUrl: null,
      total: 400,
      rank: 4,
      level: "INICIANTE",
    },
  ]),
}))

describe("RankingView", () => {
  it("renderiza a página com título, card de XP do usuário, pódio e classificação geral", async () => {
    const Component = await RankingView()
    render(Component)

    expect(
      screen.getByRole("heading", { name: "Ranking Global", level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getAllByText("Victor Matheus").length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getByText("#2 no Ranking")).toBeInTheDocument()
    expect(screen.getByText("Campeão Global")).toBeInTheDocument()
    expect(screen.getAllByText("Ana Silva").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Classificação Geral")).toBeInTheDocument()
    expect(screen.getByText("Carlos Eduardo")).toBeInTheDocument()
  })
})
