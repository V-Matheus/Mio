import { beforeEach, describe, expect, it, vi } from "vitest"
import { AchievementsController } from "./achievements.controller"
import type { AchievementsService } from "./achievements.service"

describe("AchievementsController", () => {
  let achievementsServiceMock: {
    listAchievements: ReturnType<typeof vi.fn>
    getUserAchievements: ReturnType<typeof vi.fn>
  }
  let controller: AchievementsController

  beforeEach(() => {
    achievementsServiceMock = {
      listAchievements: vi
        .fn()
        .mockResolvedValue({ achievements: [], total: 0 }),
      getUserAchievements: vi
        .fn()
        .mockResolvedValue({ entries: [], total: 0, unlockedTotal: 0 }),
    }
    controller = new AchievementsController(
      achievementsServiceMock as unknown as AchievementsService,
    )
  })

  describe("resolução de paginação", () => {
    it("usa limit=10/offset=0 por padrão quando nada é informado", async () => {
      await controller.listAchievements({})

      expect(achievementsServiceMock.listAchievements).toHaveBeenCalledWith(
        10,
        0,
      )
    })

    it("clampa limit acima de 50 para o máximo permitido", async () => {
      await controller.listAchievements({ limit: 500, offset: 0 })

      expect(achievementsServiceMock.listAchievements).toHaveBeenCalledWith(
        50,
        0,
      )
    })

    it("ignora offset negativo, tratando como 0", async () => {
      await controller.getUserAchievements({
        userCode: "usr1",
        limit: 5,
        offset: -20,
      })

      expect(achievementsServiceMock.getUserAchievements).toHaveBeenCalledWith(
        "usr1",
        5,
        0,
      )
    })
  })

  it("ListAchievements mapeia a página do service para a resposta gRPC", async () => {
    achievementsServiceMock.listAchievements.mockResolvedValue({
      achievements: [
        {
          slug: "first-lesson",
          title: "Primeiro passo",
          description: "desc",
          iconUrl: "",
          ruleType: "LESSONS_COMPLETED",
          threshold: 1,
        },
      ],
      total: 7,
    })

    const res = await controller.listAchievements({ limit: 1, offset: 0 })

    expect(res).toEqual({
      achievements: [
        {
          slug: "first-lesson",
          title: "Primeiro passo",
          description: "desc",
          iconUrl: "",
          ruleType: "LESSONS_COMPLETED",
          threshold: 1,
        },
      ],
      total: 7,
    })
  })

  it("GetUserAchievements repassa userCode e mapeia entries/total/unlockedTotal", async () => {
    achievementsServiceMock.getUserAchievements.mockResolvedValue({
      entries: [],
      total: 10,
      unlockedTotal: 2,
    })

    const res = await controller.getUserAchievements({
      userCode: "usr1",
      limit: 10,
      offset: 0,
    })

    expect(achievementsServiceMock.getUserAchievements).toHaveBeenCalledWith(
      "usr1",
      10,
      0,
    )
    expect(res).toEqual({ entries: [], total: 10, unlockedTotal: 2 })
  })
})
