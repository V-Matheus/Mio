import { describe, expect, it, vi } from "vitest"
import * as service from "@/modules/achievements/services"
import { getAchievementsQuery, getMyAchievementsQuery } from "./index"

vi.mock("@/modules/achievements/services", () => ({
  getAchievements: vi.fn(),
  getMyAchievements: vi.fn(),
}))

describe("achievements queries", () => {
  it("getAchievementsQuery delega para getAchievements do service com limit e offset padrão", async () => {
    const mockPage = {
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
    }
    vi.mocked(service.getAchievements).mockResolvedValueOnce(mockPage)

    const result = await getAchievementsQuery()

    expect(service.getAchievements).toHaveBeenCalledWith(10, 0)
    expect(result).toEqual(mockPage)
  })

  it("getMyAchievementsQuery delega para getMyAchievements do service com limit e offset informados", async () => {
    const mockPage = {
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
    }
    vi.mocked(service.getMyAchievements).mockResolvedValueOnce(mockPage)

    const result = await getMyAchievementsQuery(20, 10)

    expect(service.getMyAchievements).toHaveBeenCalledWith(20, 10)
    expect(result).toEqual(mockPage)
  })
})
