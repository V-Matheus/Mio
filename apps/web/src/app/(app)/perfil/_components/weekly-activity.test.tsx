import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { WeeklyXpSummary } from "@/lib/profile/types"
import { WeeklyActivity } from "./weekly-activity"

describe("WeeklyActivity", () => {
  const mockWeeklyXp: WeeklyXpSummary = {
    days: [
      { day: "Seg", date: "2026-08-17", xp: 160 },
      { day: "Ter", date: "2026-08-18", xp: 240 },
      { day: "Qua", date: "2026-08-19", xp: 120 },
      { day: "Qui", date: "2026-08-20", xp: 320 },
      { day: "Sex", date: "2026-08-21", xp: 280 },
      { day: "Sáb", date: "2026-08-22", xp: 160 },
      { day: "Dom", date: "2026-08-23", xp: 220 },
    ],
    totalWeeklyXp: 1500,
  }

  it("renderiza o título e o total de XP semanal", () => {
    render(<WeeklyActivity weeklyXp={mockWeeklyXp} />)

    expect(
      screen.getByRole("heading", { level: 2, name: "Atividade da Semana" }),
    ).toBeInTheDocument()
    expect(screen.getByText("+1.500 XP esta semana")).toBeInTheDocument()
  })
})
