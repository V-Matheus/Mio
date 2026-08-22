import { describe, expect, it, vi } from "vitest"
import * as service from "@/modules/gamification/services"
import { getLeaderboardQuery, getMyXpQuery } from "./index"

vi.mock("@/modules/gamification/services", () => ({
  getMyXp: vi.fn(),
  getLeaderboard: vi.fn(),
}))

describe("gamification queries", () => {
  it("getMyXpQuery delega para getMyXp do service", async () => {
    const mockXp = {
      total: 500,
      level: "JUNIOR" as const,
      progressToNext: 10,
      xpToNextLevel: 950,
      rank: 2,
    }
    vi.mocked(service.getMyXp).mockResolvedValueOnce(mockXp)

    const result = await getMyXpQuery()

    expect(service.getMyXp).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockXp)
  })

  it("getLeaderboardQuery delega para getLeaderboard do service com limit e offset", async () => {
    const mockEntries = [
      {
        userCode: "usr1",
        name: "Alice",
        avatarUrl: null,
        total: 1000,
        rank: 1,
        level: "JUNIOR",
      },
    ]
    vi.mocked(service.getLeaderboard).mockResolvedValueOnce(mockEntries)

    const result = await getLeaderboardQuery(20, 10)

    expect(service.getLeaderboard).toHaveBeenCalledWith(20, 10)
    expect(result).toEqual(mockEntries)
  })
})
