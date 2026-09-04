import { describe, expect, it, vi } from "vitest"
import { getHomeData } from "./home.service"

const mockRequest = vi.fn()

vi.mock("@/shared/gateway/client", () => ({
  getGatewayClient: vi.fn(() => ({
    request: mockRequest,
  })),
  gatewayError: vi.fn(),
}))

describe("home.service", () => {
  it("deve retornar dados consolidados da Home com sucesso", async () => {
    mockRequest.mockResolvedValueOnce({
      profile: {
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
          progressToNext: 45,
          xpToNextLevel: 500,
          rank: 2,
        },
        streak: {
          streakCurrent: 12,
          streakBest: 15,
          lastStudyDate: "2026-08-25T10:00:00.000Z",
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
            lessonSlug: "tags-iniciais",
            lessonTitle: "Primeiras Tags",
            trackSlug: "front-end",
            trackTitle: "Mundo do Front-End",
            completedAt: "2026-08-25T12:00:00.000Z",
          },
        ],
      },
    })

    const result = await getHomeData()

    expect(result).not.toBeNull()
    expect(result?.user.name).toBe("Júnior Dev")
    expect(result?.xp.total).toBe(1500)
    expect(result?.streak.streakCurrent).toBe(12)
    expect(result?.stats.totalCompletedLessons).toBe(22)
    expect(result?.inProgressTracks).toHaveLength(1)
    expect(result?.recentActivities).toHaveLength(1)
  })

  it("deve retornar null quando profile for inexistente ou ocorrer erro", async () => {
    mockRequest.mockRejectedValueOnce(new Error("Network Error"))

    const result = await getHomeData()

    expect(result).toBeNull()
  })
})
