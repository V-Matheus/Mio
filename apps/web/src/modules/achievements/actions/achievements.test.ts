import { describe, expect, it, vi } from "vitest"
import * as queries from "@/modules/achievements/queries"
import { loadMoreAchievementsAction } from "./achievements"

vi.mock("@/modules/achievements/queries", () => ({
  getMyAchievementsQuery: vi.fn(),
}))

describe("loadMoreAchievementsAction", () => {
  it("delega para getMyAchievementsQuery com o limit e offset do scroll infinito", async () => {
    const mockPage = {
      items: [
        {
          slug: "ten-lessons",
          title: "Maratonista",
          description: "Conclua 10 lições.",
          iconUrl: null,
          unlocked: false,
          unlockedAt: null,
          progress: 3,
          threshold: 10,
        },
      ],
      total: 12,
      unlockedTotal: 4,
    }
    vi.mocked(queries.getMyAchievementsQuery).mockResolvedValueOnce(mockPage)

    const result = await loadMoreAchievementsAction(10, 10)

    expect(queries.getMyAchievementsQuery).toHaveBeenCalledWith(10, 10)
    expect(result).toEqual(mockPage)
  })
})
