import { beforeEach, describe, expect, it, vi } from "vitest"
import { getProfile } from "./service"

const { mockRequest, mockGetClient } = vi.hoisted(() => {
  const mockRequest = vi.fn()
  const mockGetClient = vi.fn(async () => ({ request: mockRequest }))
  return { mockRequest, mockGetClient }
})

vi.mock("server-only", () => ({}))
vi.mock("@/lib/gateway/client", () => ({
  getGatewayClient: mockGetClient,
  gatewayError: vi.fn(),
}))

describe("profile service", () => {
  beforeEach(() => {
    mockRequest.mockReset()
    mockGetClient.mockClear()
  })

  describe("getProfile", () => {
    it("retorna o perfil consolidado do aluno", async () => {
      mockRequest.mockResolvedValueOnce({
        profile: {
          user: {
            code: "usr-1",
            name: "Alice",
            email: "alice@test.com",
            avatarUrl: "https://avatar.png",
            roles: ["STUDENT"],
          },
          xp: {
            total: 1200,
            level: "JUNIOR",
            progressToNext: 40,
            xpToNextLevel: 1800,
            rank: 1,
          },
          streak: {
            streakCurrent: 7,
            streakBest: 14,
            lastStudyDate: "2026-08-17T00:00:00.000Z",
          },
          stats: {
            totalCompletedLessons: 24,
            completedTracksCount: 2,
          },
          weeklyXp: {
            days: [
              { day: "Seg", date: "2026-08-17", xp: 150 },
              { day: "Ter", date: "2026-08-18", xp: 0 },
            ],
            totalWeeklyXp: 150,
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
              currentLessonTitle: "Generics Avançado",
            },
          ],
          recentActivities: [
            {
              lessonId: 101,
              lessonSlug: "intro",
              lessonTitle: "Introdução ao TS",
              trackSlug: "ts-track",
              trackTitle: "TypeScript Moderno",
              completedAt: "2026-08-17T12:00:00.000Z",
            },
          ],
        },
      })

      const result = await getProfile()

      expect(result).not.toBeNull()
      expect(result?.user.name).toBe("Alice")
      expect(result?.xp.total).toBe(1200)
      expect(result?.streak.streakCurrent).toBe(7)
      expect(result?.stats.totalCompletedLessons).toBe(24)
      expect(result?.stats.completedTracksCount).toBe(2)
      expect(result?.weeklyXp.totalWeeklyXp).toBe(150)
      expect(result?.inProgressTracks).toHaveLength(1)
      expect(result?.recentActivities).toHaveLength(1)
    })

    it("retorna null em caso de erro de rede ou gateway", async () => {
      mockRequest.mockRejectedValueOnce(new Error("Gateway indisponível"))

      const result = await getProfile()

      expect(result).toBeNull()
    })
  })
})
