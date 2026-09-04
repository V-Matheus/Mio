import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HomeStats } from "./home-stats"

describe("HomeStats", () => {
  it("deve renderizar os 3 cards de estatísticas com os valores formatados", () => {
    render(
      <HomeStats
        streak={{
          streakCurrent: 12,
          streakBest: 15,
          lastStudyDate: null,
        }}
        xp={{
          total: 1500,
          level: "JUNIOR",
          progressToNext: 50,
          xpToNextLevel: 500,
          rank: 1,
        }}
        stats={{
          totalCompletedLessons: 22,
          completedTracksCount: 2,
        }}
      />,
    )

    expect(screen.getByText(/12 dias/i)).toBeInTheDocument()
    expect(screen.getByText(/Sequência/i)).toBeInTheDocument()
    expect(screen.getByText(/1\.500/i)).toBeInTheDocument()
    expect(screen.getByText(/XP Total/i)).toBeInTheDocument()
    expect(screen.getByText(/22/i)).toBeInTheDocument()
    expect(screen.getByText(/Aulas Concluídas/i)).toBeInTheDocument()
    expect(screen.queryByText(/Conquistas/i)).not.toBeInTheDocument()
  })

  it("deve renderizar '1 dia' no singular quando streak for 1", () => {
    render(
      <HomeStats
        streak={{
          streakCurrent: 1,
          streakBest: 1,
          lastStudyDate: null,
        }}
        xp={{
          total: 100,
          level: "INICIANTE",
          progressToNext: 10,
          xpToNextLevel: 400,
          rank: 5,
        }}
        stats={{
          totalCompletedLessons: 1,
          completedTracksCount: 0,
        }}
      />,
    )

    expect(screen.getByText(/1 dia/i)).toBeInTheDocument()
  })
})
