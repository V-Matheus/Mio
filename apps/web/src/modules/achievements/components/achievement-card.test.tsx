import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { UserAchievement } from "@/modules/achievements/types"
import { AchievementCard } from "./achievement-card"

describe("AchievementCard", () => {
  it("renderiza uma conquista desbloqueada com o selo de concluída", () => {
    const unlocked: UserAchievement = {
      slug: "first-lesson",
      title: "Primeiro passo",
      description: "Conclua sua primeira lição.",
      iconUrl: null,
      unlocked: true,
      unlockedAt: "2026-05-11T20:30:06.000Z",
      progress: 1,
      threshold: 1,
    }

    render(<AchievementCard achievement={unlocked} />)

    expect(screen.getByText("Primeiro passo")).toBeInTheDocument()
    expect(screen.getByText("Conclua sua primeira lição.")).toBeInTheDocument()
    expect(screen.getByText("Desbloqueada")).toBeInTheDocument()
    expect(screen.getByText("1 / 1")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("renderiza uma conquista bloqueada com percentual de progresso", () => {
    const locked: UserAchievement = {
      slug: "ten-lessons",
      title: "Maratonista",
      description: "Conclua 10 lições.",
      iconUrl: null,
      unlocked: false,
      unlockedAt: null,
      progress: 3,
      threshold: 10,
    }

    render(<AchievementCard achievement={locked} />)

    expect(screen.getByText("Maratonista")).toBeInTheDocument()
    expect(screen.getByText("3 / 10")).toBeInTheDocument()
    expect(screen.getByText("30%")).toBeInTheDocument()
    expect(screen.queryByText("Desbloqueada")).not.toBeInTheDocument()
  })
})
