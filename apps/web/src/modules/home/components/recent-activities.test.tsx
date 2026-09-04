import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RecentActivities } from "./recent-activities"

describe("RecentActivities", () => {
  it("deve renderizar a lista de atividades recentes e banner de ofensiva", () => {
    const mockActivities = [
      {
        lessonId: 10,
        lessonSlug: "tags-html",
        lessonTitle: "Primeiras Tags",
        trackSlug: "front-end",
        trackTitle: "Mundo do Front-End",
        completedAt: new Date().toISOString(),
      },
    ]

    render(
      <RecentActivities
        activities={mockActivities}
        streak={{ streakCurrent: 12, streakBest: 15, lastStudyDate: null }}
      />,
    )

    expect(screen.getByText(/Atividades Recentes/i)).toBeInTheDocument()
    expect(screen.getByText("Aula concluída")).toBeInTheDocument()
    expect(
      screen.getByText(/Primeiras Tags • Mundo do Front-End/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/\+50 XP/i)).toBeInTheDocument()
    expect(screen.getByText(/Sequência de 12 dias!/i)).toBeInTheDocument()
  })

  it("deve renderizar estado vazio quando não houver atividades nem streak", () => {
    render(
      <RecentActivities
        activities={[]}
        streak={{ streakCurrent: 0, streakBest: 0, lastStudyDate: null }}
      />,
    )

    expect(screen.getByText(/Nenhuma atividade recente/i)).toBeInTheDocument()
  })
})
