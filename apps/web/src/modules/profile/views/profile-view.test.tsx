import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { UserProfile } from "@/modules/profile/types"
import { ProfileView } from "./profile-view"

const mockGetProfileQuery = vi.fn()

vi.mock("../queries/profile", () => ({
  getProfileQuery: () => mockGetProfileQuery(),
}))

const mockProfileData: UserProfile = {
  user: {
    code: "usr-123",
    name: "Victor Sousa",
    email: "victor@example.com",
    avatarUrl: null,
    roles: ["STUDENT"],
  },
  xp: {
    total: 1500,
    level: "JUNIOR",
    progressToNext: 60,
    xpToNextLevel: 1000,
    rank: 3,
  },
  streak: {
    streakCurrent: 5,
    streakBest: 12,
    lastStudyDate: "2026-08-17T12:00:00.000Z",
  },
  stats: {
    totalCompletedLessons: 18,
    completedTracksCount: 1,
  },
  weeklyXp: {
    days: [
      { day: "Seg", date: "2026-08-17", xp: 120 },
      { day: "Ter", date: "2026-08-18", xp: 0 },
      { day: "Qua", date: "2026-08-19", xp: 0 },
      { day: "Qui", date: "2026-08-20", xp: 0 },
      { day: "Sex", date: "2026-08-21", xp: 0 },
      { day: "Sáb", date: "2026-08-22", xp: 0 },
      { day: "Dom", date: "2026-08-23", xp: 0 },
    ],
    totalWeeklyXp: 120,
  },
  inProgressTracks: [
    {
      trackId: 1,
      trackSlug: "ts-track",
      trackTitle: "TypeScript Moderno",
      totalLessons: 10,
      completedLessons: 4,
      progressPercentage: 40,
      currentLessonSlug: "generics",
      currentLessonTitle: "Tipos Genéricos",
    },
  ],
  recentActivities: [
    {
      lessonId: 101,
      lessonSlug: "intro",
      lessonTitle: "Introdução ao TS",
      trackSlug: "ts-track",
      trackTitle: "TypeScript Moderno",
      completedAt: "2026-08-17T10:00:00.000Z",
    },
  ],
}

describe("ProfileView", () => {
  beforeEach(() => {
    mockGetProfileQuery.mockReset()
  })

  it("renderiza os dados completos do perfil do aluno", async () => {
    mockGetProfileQuery.mockResolvedValueOnce(mockProfileData)

    const Page = await ProfileView()
    render(Page)

    expect(
      screen.getByRole("heading", { level: 1, name: /Victor Sousa/i }),
    ).toBeInTheDocument()
    expect(screen.getByText("victor@example.com")).toBeInTheDocument()
    expect(screen.getByText("Nível Júnior")).toBeInTheDocument()
    expect(screen.getByText("5 dias")).toBeInTheDocument()
    expect(screen.getByText("18 lições")).toBeInTheDocument()
    expect(screen.getByText("1 curso")).toBeInTheDocument()
    expect(screen.getAllByText("TypeScript Moderno").length).toBeGreaterThan(0)
    expect(screen.getByText("Introdução ao TS")).toBeInTheDocument()
  })

  it("renderiza mensagem de erro amigável se a busca do perfil falhar", async () => {
    mockGetProfileQuery.mockResolvedValueOnce(null)

    const Page = await ProfileView()
    render(Page)

    expect(
      screen.getByText(
        "Não foi possível carregar as informações do seu perfil.",
      ),
    ).toBeInTheDocument()
  })
})
