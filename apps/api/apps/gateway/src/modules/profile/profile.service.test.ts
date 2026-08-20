import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AuthService } from "../auth/auth.service"
import type { GamificationGatewayService } from "../gamification/gamification.service"
import { Level } from "../gamification/gamification.types"
import type { ProgressGatewayService } from "../progress/progress.service"
import { ProfileService } from "./profile.service"

describe("ProfileService", () => {
  let authServiceMock: { me: ReturnType<typeof vi.fn> }
  let gamificationServiceMock: {
    getUserGamificationProfile: ReturnType<typeof vi.fn>
  }
  let progressServiceMock: {
    getStudentProfileProgress: ReturnType<typeof vi.fn>
  }
  let service: ProfileService

  beforeEach(() => {
    authServiceMock = {
      me: vi.fn().mockResolvedValue({
        code: "usr1",
        email: "alice@test.com",
        name: "Alice",
        avatarUrl: null,
        roles: ["STUDENT"],
      }),
    }
    gamificationServiceMock = {
      getUserGamificationProfile: vi.fn().mockResolvedValue({
        userXp: {
          total: 500,
          level: Level.JUNIOR,
          progressToNext: 20,
          xpToNextLevel: 1000,
          rank: 2,
        },
        streak: {
          streakCurrent: 5,
          streakBest: 10,
          lastStudyDate: "2026-08-17T12:00:00.000Z",
        },
        weeklyXp: {
          days: [{ day: "Seg", date: "2026-08-17", xp: 100 }],
          totalWeeklyXp: 100,
        },
      }),
    }
    progressServiceMock = {
      getStudentProfileProgress: vi.fn().mockResolvedValue({
        stats: {
          totalCompletedLessons: 15,
          completedTracksCount: 1,
        },
        inProgressTracks: [
          {
            trackId: 1,
            trackSlug: "ts-track",
            trackTitle: "TypeScript",
            totalLessons: 10,
            completedLessons: 4,
            progressPercentage: 40,
            currentLessonSlug: "generics",
            currentLessonTitle: "Generics",
          },
        ],
        recentActivities: [
          {
            lessonId: 101,
            lessonSlug: "intro",
            lessonTitle: "Introdução",
            trackSlug: "ts-track",
            trackTitle: "TypeScript",
            completedAt: "2026-08-17T10:00:00.000Z",
          },
        ],
      }),
    }

    service = new ProfileService(
      authServiceMock as unknown as AuthService,
      gamificationServiceMock as unknown as GamificationGatewayService,
      progressServiceMock as unknown as ProgressGatewayService,
    )
  })

  it("agrega dados de auth, gamificação e progresso em paralelo", async () => {
    const profile = await service.getProfile("usr1")

    expect(authServiceMock.me).toHaveBeenCalledWith("usr1")
    expect(
      gamificationServiceMock.getUserGamificationProfile,
    ).toHaveBeenCalledWith("usr1")
    expect(progressServiceMock.getStudentProfileProgress).toHaveBeenCalledWith(
      "usr1",
    )

    expect(profile.user.name).toBe("Alice")
    expect(profile.xp.total).toBe(500)
    expect(profile.streak.streakCurrent).toBe(5)
    expect(profile.stats.totalCompletedLessons).toBe(15)
    expect(profile.stats.completedTracksCount).toBe(1)
    expect(profile.weeklyXp.totalWeeklyXp).toBe(100)
    expect(profile.inProgressTracks).toHaveLength(1)
    expect(profile.recentActivities).toHaveLength(1)
  })
})
