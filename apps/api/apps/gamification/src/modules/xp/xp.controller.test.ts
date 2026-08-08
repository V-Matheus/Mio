import { beforeEach, describe, expect, it, vi } from "vitest"
import type { LeaderboardService } from "../leaderboard/leaderboard.service"
import { XpController } from "./xp.controller"
import type { XpService } from "./xp.service"

describe("XpController", () => {
  let xpServiceMock: {
    getUserXp: ReturnType<typeof vi.fn>
  }
  let leaderboardMock: {
    getLeaderboard: ReturnType<typeof vi.fn>
  }
  let controller: XpController

  beforeEach(() => {
    xpServiceMock = {
      getUserXp: vi.fn(),
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
    it("delega para XpService e mapeia campos snake_case para o proto", async () => {
      xpServiceMock.getUserXp.mockResolvedValue({
        total: 120,
        level: "INICIANTE",
        progressToNext: 20,
        xpToNextLevel: 380,
        rank: 3,
      })

      const res = await controller.getUserXp({ user_code: "usr1" })

      expect(xpServiceMock.getUserXp).toHaveBeenCalledWith("usr1")
      expect(res).toEqual({
        total: 120,
        level: "INICIANTE",
        progress_to_next: 20,
        xp_to_next_level: 380,
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
            user_code: "usr1",
            name: "Alice",
            avatar_url: "https://avatar.png",
            total: 500,
            rank: 1,
            level: "JUNIOR",
          },
        ],
        total_users: 1,
      })
    })
  })
})
