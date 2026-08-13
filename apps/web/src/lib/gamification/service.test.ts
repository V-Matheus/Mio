import { beforeEach, describe, expect, it, vi } from "vitest"
import { getLeaderboard, getMyXp } from "./service"

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

describe("gamification service", () => {
  beforeEach(() => {
    mockRequest.mockReset()
    mockGetClient.mockClear()
  })

  describe("getMyXp", () => {
    it("retorna dados de XP e nível do usuário logado", async () => {
      mockRequest.mockResolvedValueOnce({
        myXp: {
          total: 550,
          level: "JUNIOR",
          progressToNext: 10,
          xpToNextLevel: 950,
          rank: 2,
        },
      })

      const result = await getMyXp()

      expect(result).toEqual({
        total: 550,
        level: "JUNIOR",
        progressToNext: 10,
        xpToNextLevel: 950,
        rank: 2,
      })
    })

    it("retorna null em caso de erro", async () => {
      mockRequest.mockRejectedValueOnce(new Error("Network error"))

      const result = await getMyXp()

      expect(result).toBeNull()
    })
  })

  describe("getLeaderboard", () => {
    it("retorna a listagem do ranking global", async () => {
      mockRequest.mockResolvedValueOnce({
        leaderboard: [
          {
            userCode: "usr1",
            name: "Alice",
            avatarUrl: "https://avatar.png",
            total: 1000,
            rank: 1,
            level: "JUNIOR",
          },
          {
            userCode: "usr2",
            name: "Bob",
            avatarUrl: null,
            total: 500,
            rank: 2,
            level: "INICIANTE",
          },
        ],
      })

      const result = await getLeaderboard(10, 0)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        userCode: "usr1",
        name: "Alice",
        avatarUrl: "https://avatar.png",
        total: 1000,
        rank: 1,
        level: "JUNIOR",
      })
    })

    it("retorna array vazio em caso de erro", async () => {
      mockRequest.mockRejectedValueOnce(new Error("Gateway down"))

      const result = await getLeaderboard()

      expect(result).toEqual([])
    })
  })
})
