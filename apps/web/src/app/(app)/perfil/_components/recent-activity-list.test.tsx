import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { RecentActivityEntry } from "@/lib/profile/types"
import { RecentActivityList } from "./recent-activity-list"

describe("RecentActivityList", () => {
  it("renderiza estado vazio quando não há atividades recentes", () => {
    render(<RecentActivityList activities={[]} />)

    expect(screen.getByText("Histórico Recente")).toBeInTheDocument()
    expect(screen.getByText("Nenhuma atividade recente")).toBeInTheDocument()
  })

  it("renderiza a lista de atividades recentes com título da lição e da trilha", () => {
    const activities: RecentActivityEntry[] = [
      {
        lessonId: 101,
        lessonSlug: "funcoes",
        lessonTitle: "Funções e Escopo",
        trackSlug: "js-moderno",
        trackTitle: "JavaScript Moderno",
        completedAt: "2026-08-17T12:00:00.000Z",
      },
    ]

    render(<RecentActivityList activities={activities} />)

    expect(screen.getByText("Funções e Escopo")).toBeInTheDocument()
    expect(screen.getByText("JavaScript Moderno")).toBeInTheDocument()
    expect(screen.queryByText("+50 XP")).not.toBeInTheDocument()
  })
})
