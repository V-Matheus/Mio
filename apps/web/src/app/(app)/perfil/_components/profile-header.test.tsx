import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { UserProfile } from "@/lib/profile/types"
import { ProfileHeader } from "./profile-header"

describe("ProfileHeader", () => {
  const mockProfile: UserProfile = {
    user: {
      code: "usr-123",
      name: "Victor Matheus",
      email: "victor@example.com",
      avatarUrl: null,
      roles: ["STUDENT"],
    },
    xp: {
      total: 1500,
      level: "JUNIOR",
      progressToNext: 60,
      xpToNextLevel: 1000,
      rank: 2,
    },
    streak: {
      streakCurrent: 5,
      streakBest: 10,
      lastStudyDate: "2026-08-17T12:00:00.000Z",
    },
    stats: {
      totalCompletedLessons: 20,
      completedTracksCount: 2,
    },
    weeklyXp: {
      days: [],
      totalWeeklyXp: 120,
    },
    inProgressTracks: [],
    recentActivities: [],
  }

  it("renderiza o cabeçalho com nome, email, nível e pontuação de XP", () => {
    render(<ProfileHeader profile={mockProfile} />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Victor Matheus" }),
    ).toBeInTheDocument()
    expect(screen.getByText("victor@example.com")).toBeInTheDocument()
    expect(screen.getByText("Nível Júnior")).toBeInTheDocument()
    expect(screen.getByText("1.500 XP")).toBeInTheDocument()
    expect(screen.getByText(/\/ 2.500 XP/)).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /editar perfil/i }),
    ).toHaveAttribute("href", "/perfil/configuracoes")
    expect(screen.getByAltText("Mascote Mio")).toBeInTheDocument()
  })

  it("renderiza imagem do avatar quando fornecido avatarUrl", () => {
    const profileWithAvatar: UserProfile = {
      ...mockProfile,
      user: {
        ...mockProfile.user,
        avatarUrl: "https://example.com/avatar.jpg",
      },
    }

    render(<ProfileHeader profile={profileWithAvatar} />)

    const avatar = screen.getByAltText("Victor Matheus")
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg")
  })
})
