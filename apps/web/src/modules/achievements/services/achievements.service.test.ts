import { beforeEach, describe, expect, it, vi } from "vitest"
import { getAchievements, getMyAchievements } from "./achievements.service"

const { mockRequest, mockGetClient } = vi.hoisted(() => {
  const mockRequest = vi.fn()
  const mockGetClient = vi.fn(async () => ({ request: mockRequest }))
  return { mockRequest, mockGetClient }
})

vi.mock("server-only", () => ({}))
vi.mock("@/shared/gateway/client", () => ({
  getGatewayClient: mockGetClient,
  gatewayError: vi.fn(),
}))

describe("achievements service", () => {
  beforeEach(() => {
    mockRequest.mockReset()
    mockGetClient.mockClear()
  })

  describe("getAchievements", () => {
    it("retorna a página paginada do catálogo de conquistas disponíveis", async () => {
      mockRequest.mockResolvedValueOnce({
        achievements: {
          items: [
            {
              slug: "first-lesson",
              title: "Primeiro passo",
              description: "Conclua sua primeira lição.",
              iconUrl: "",
              ruleType: "LESSONS_COMPLETED",
              threshold: 1,
            },
          ],
          total: 7,
        },
      })

      const result = await getAchievements(10, 0)

      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        limit: 10,
        offset: 0,
      })
      expect(result).toEqual({
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
        total: 7,
      })
    })

    it("retorna página vazia em caso de erro", async () => {
      mockRequest.mockRejectedValueOnce(new Error("Gateway down"))

      const result = await getAchievements(10, 0)

      expect(result).toEqual({ items: [], total: 0 })
    })
  })

  describe("getMyAchievements", () => {
    it("retorna a página paginada das conquistas com o progresso do usuário logado", async () => {
      mockRequest.mockResolvedValueOnce({
        myAchievements: {
          items: [
            {
              slug: "first-lesson",
              title: "Primeiro passo",
              description: "Conclua sua primeira lição.",
              iconUrl: "",
              unlocked: true,
              unlockedAt: "2026-05-11T20:30:06.000Z",
              progress: 1,
              threshold: 1,
            },
            {
              slug: "ten-lessons",
              title: "Maratonista",
              description: "Conclua 10 lições.",
              iconUrl: "",
              unlocked: false,
              unlockedAt: "",
              progress: 1,
              threshold: 10,
            },
          ],
          total: 10,
          unlockedTotal: 1,
        },
      })

      const result = await getMyAchievements(10, 0)

      expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
        limit: 10,
        offset: 0,
      })
      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(10)
      expect(result.unlockedTotal).toBe(1)
      expect(result.items[0]).toEqual({
        slug: "first-lesson",
        title: "Primeiro passo",
        description: "Conclua sua primeira lição.",
        iconUrl: null,
        unlocked: true,
        unlockedAt: "2026-05-11T20:30:06.000Z",
        progress: 1,
        threshold: 1,
      })
      expect(result.items[1]?.unlockedAt).toBeNull()
    })

    it("retorna página vazia em caso de erro", async () => {
      mockRequest.mockRejectedValueOnce(new Error("Gateway down"))

      const result = await getMyAchievements(10, 0)

      expect(result).toEqual({ items: [], total: 0, unlockedTotal: 0 })
    })
  })
})
