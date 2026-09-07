import { describe, expect, it, vi } from "vitest"
import { AchievementsResolver } from "./achievements.resolver"
import type { AchievementsGatewayService } from "./achievements.service"

describe("AchievementsResolver", () => {
  function makeResolver() {
    const achievementsService = {
      listAchievements: vi.fn().mockResolvedValue({
        items: [
          {
            slug: "first-lesson",
            title: "Primeiro passo",
            description: "Conclua sua primeira lição.",
            iconUrl: null,
            ruleType: "LESSONS_COMPLETED",
            threshold: 1,
          },
        ],
        total: 1,
      }),
      getUserAchievements: vi.fn().mockResolvedValue({
        items: [
          {
            slug: "first-lesson",
            title: "Primeiro passo",
            description: "Conclua sua primeira lição.",
            iconUrl: null,
            unlocked: true,
            unlockedAt: "2026-05-11T20:30:06.000Z",
            progress: 1,
            threshold: 1,
          },
        ],
        total: 1,
        unlockedTotal: 1,
      }),
    }

    const resolver = new AchievementsResolver(
      achievementsService as unknown as AchievementsGatewayService,
    )
    return { resolver, achievementsService }
  }

  it("achievements delega para AchievementsGatewayService.listAchievements com limit e offset", async () => {
    const { resolver, achievementsService } = makeResolver()

    const result = await resolver.achievements(10, 0)

    expect(achievementsService.listAchievements).toHaveBeenCalledWith(10, 0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.slug).toBe("first-lesson")
    expect(result.total).toBe(1)
  })

  it("myAchievements delega para AchievementsGatewayService.getUserAchievements com o userCode logado, limit e offset", async () => {
    const { resolver, achievementsService } = makeResolver()

    const result = await resolver.myAchievements("user_123", 10, 0)

    expect(achievementsService.getUserAchievements).toHaveBeenCalledWith(
      "user_123",
      10,
      0,
    )
    expect(result).toEqual({
      items: [
        {
          slug: "first-lesson",
          title: "Primeiro passo",
          description: "Conclua sua primeira lição.",
          iconUrl: null,
          unlocked: true,
          unlockedAt: "2026-05-11T20:30:06.000Z",
          progress: 1,
          threshold: 1,
        },
      ],
      total: 1,
      unlockedTotal: 1,
    })
  })
})
