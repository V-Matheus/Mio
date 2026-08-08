import { describe, expect, it, vi } from "vitest"
import { GamificationResolver } from "./gamification.resolver"
import type { GamificationGatewayService } from "./gamification.service"
import { Level } from "./gamification.types"

describe("GamificationResolver", () => {
  function makeResolver() {
    const gamificationService = {
      getUserXp: vi.fn().mockResolvedValue({
        total: 550,
        level: Level.JUNIOR,
        progressToNext: 10,
        xpToNextLevel: 950,
        rank: 3,
      }),
      getLeaderboard: vi.fn().mockResolvedValue([
        {
          userCode: "usr1",
          name: "Alice",
          avatarUrl: "https://avatar.png",
          total: 1000,
          rank: 1,
          level: "JUNIOR",
        },
      ]),
    }

    const resolver = new GamificationResolver(
      gamificationService as unknown as GamificationGatewayService,
    )
    return { resolver, gamificationService }
  }

  it("myXp delega para GamificationGatewayService.getUserXp com o userCode logado", async () => {
    const { resolver, gamificationService } = makeResolver()

    const result = await resolver.myXp("user_123")

    expect(gamificationService.getUserXp).toHaveBeenCalledWith("user_123")
    expect(result).toEqual({
      total: 550,
      level: Level.JUNIOR,
      progressToNext: 10,
      xpToNextLevel: 950,
      rank: 3,
    })
  })

  it("leaderboard delega para GamificationGatewayService.getLeaderboard com limit e offset", async () => {
    const { resolver, gamificationService } = makeResolver()

    const result = await resolver.leaderboard(20, 10)

    expect(gamificationService.getLeaderboard).toHaveBeenCalledWith(20, 10)
    expect(result).toHaveLength(1)
    expect(result[0]?.userCode).toBe("usr1")
  })
})
