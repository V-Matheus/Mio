import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { HomeView } from "./home-view"

vi.mock("@/modules/home/queries", () => ({
  getHomeQuery: vi.fn(),
}))

import { getHomeQuery } from "@/modules/home/queries"

describe("HomeView", () => {
  it("deve renderizar a tela de Home autenticada completa com dados", async () => {
    vi.mocked(getHomeQuery).mockResolvedValueOnce({
      user: {
        code: "usr123",
        name: "Júnior Dev",
        email: "junior@mio.dev",
        avatarUrl: null,
        roles: ["STUDENT"],
      },
      xp: {
        total: 1500,
        level: "JUNIOR",
        progressToNext: 50,
        xpToNextLevel: 500,
        rank: 2,
      },
      streak: {
        streakCurrent: 12,
        streakBest: 15,
        lastStudyDate: null,
      },
      stats: {
        totalCompletedLessons: 22,
        completedTracksCount: 1,
      },
      inProgressTracks: [
        {
          trackId: 1,
          trackSlug: "front-end",
          trackTitle: "Mundo do Front-End",
          totalLessons: 20,
          completedLessons: 9,
          progressPercentage: 45,
          currentLessonSlug: "html-basics",
          currentLessonTitle: "Fundamentos do HTML",
        },
      ],
      recentActivities: [
        {
          lessonId: 10,
          lessonSlug: "primeiras-tags",
          lessonTitle: "Primeiras Tags",
          trackSlug: "front-end",
          trackTitle: "Mundo do Front-End",
          completedAt: new Date().toISOString(),
        },
      ],
    })

    const view = await HomeView()
    render(view)

    expect(screen.getByText(/Olá, Júnior! 👋/i)).toBeInTheDocument()
    expect(screen.getAllByText(/12 dias/i)).toHaveLength(2)
    expect(screen.getByText(/1\.500/i)).toBeInTheDocument()
    expect(screen.getByText(/22/i)).toBeInTheDocument()
    expect(screen.getByText(/Cursos em Andamento/i)).toBeInTheDocument()
    expect(
      screen.getAllByText("Mundo do Front-End").length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Atividades Recentes/i)).toBeInTheDocument()
    expect(screen.getByText(/Próximos Passos/i)).toBeInTheDocument()
  })

  it("deve exibir mensagem de erro amigável quando a query falhar", async () => {
    vi.mocked(getHomeQuery).mockResolvedValueOnce(null)

    const view = await HomeView()
    render(view)

    expect(
      screen.getByText(
        /Não foi possível carregar as informações do seu painel/i,
      ),
    ).toBeInTheDocument()
  })
})
