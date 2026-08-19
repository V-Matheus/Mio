import { beforeEach, describe, expect, it, vi } from "vitest"
import type { LeaderboardService } from "../leaderboard/leaderboard.service"
import { XpController } from "./xp.controller"
import type { XpService } from "./xp.service"

describe("XpController", () => {
  let xpServiceMock: {
    getUserXp: ReturnType<typeof vi.fn>
    getUserGamificationProfile: ReturnType<typeof vi.fn>
  }
  let leaderboardMock: {
    getLeaderboard: ReturnType<typeof vi.fn>
  }
  let controller: XpController

  beforeEach(() => {
    xpServiceMock = {
      getUserXp: vi.fn(),
      getUserGamificationProfile: vi.fn(),
    }
    leaderboardMock = {
      getLeaderboard: vi.fn(),
    }
    controller = new XpController(
      xpServiceMock as unknown as XpService,
      leaderboardMock as unknown as LeaderboardService,
    )
  })

  describe("getUserXp", () => {
    it("delega para XpService e retorna UserXpResponse tipada", async () => {
      xpServiceMock.getUserXp.mockResolvedValue({
        total: 120,
        level: "INICIANTE",
        progressToNext: 20,
        xpToNextLevel: 380,
        rank: 3,
      })

      const res = await controller.getUserXp({ userCode: "usr1" })

      expect(xpServiceMock.getUserXp).toHaveBeenCalledWith("usr1")
      expect(res).toEqual({
        total: 120,
        level: "INICIANTE",
        progressToNext: 20,
        xpToNextLevel: 380,
        rank: 3,
      })
    })
  })

  describe("getLeaderboard", () => {
    it("delega para LeaderboardService e formata resposta", async () => {
      leaderboardMock.getLeaderboard.mockResolvedValue({
        entries: [
          {
            userCode: "usr1",
            name: "Alice",
            avatarUrl: "https://avatar.png",
            total: 500,
            rank: 1,
            level: "JUNIOR",
          },
        ],
        totalUsers: 1,
      })

      const res = await controller.getLeaderboard({ limit: 10, offset: 0 })

      expect(leaderboardMock.getLeaderboard).toHaveBeenCalledWith(10, 0)
      expect(res).toEqual({
        entries: [
          {
            userCode: "usr1",
            name: "Alice",
            avatarUrl: "https://avatar.png",
            total: 500,
            rank: 1,
            level: "JUNIOR",
          },
        ],
        totalUsers: 1,
      })
    })
  })

  describe("getUserGamificationProfile", () => {
    it("delega para XpService e formata resposta com streak e weekly XP", async () => {
      xpServiceMock.getUserGamificationProfile = vi.fn().mockResolvedValue({
        total: 120,
        level: "INICIANTE",
        progressToNext: 20,
        xpToNextLevel: 380,
        rank: 3,
        streak: {
          streakCurrent: 4,
          streakBest: 8,
          lastStudyDate: "2026-08-17T12:00:00.000Z",
        },
        weeklyXp: {
          days: [
            { day: "Seg", date: "2026-08-17", xp: 120 },
            { day: "Ter", date: "2026-08-18", xp: 0 },
          ],
          totalWeeklyXp: 120,
        },
      })

      const res = await controller.getUserGamificationProfile({
        userCode: "usr1",
      })

      expect(xpServiceMock.getUserGamificationProfile).toHaveBeenCalledWith(
        "usr1",
      )
      expect(res).toEqual({
        total: 120,
        level: "INICIANTE",
        progressToNext: 20,
        xpToNextLevel: 380,
        rank: 3,
        streak: {
          streakCurrent: 4,
          streakBest: 8,
          lastStudyDate: "2026-08-17T12:00:00.000Z",
        },
        weeklyXp: {
          days: [
            { day: "Seg", date: "2026-08-17", xp: 120 },
            { day: "Ter", date: "2026-08-18", xp: 0 },
          ],
          totalWeeklyXp: 120,
        },
      })
    })
  })
})
