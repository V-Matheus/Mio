import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CoreClientService } from "../core-client/core-client.service"
import type { GamificationClientService } from "../gamification-client/gamification-client.service"
import type { PrismaService } from "../prisma/prisma.service"
import { AchievementsService } from "./achievements.service"

describe("AchievementsService", () => {
  let prismaMock: {
    achievement: {
      findMany: ReturnType<typeof vi.fn>
      count: ReturnType<typeof vi.fn>
    }
    userAchievement: {
      findMany: ReturnType<typeof vi.fn>
      count: ReturnType<typeof vi.fn>
    }
  }
  let gamificationClientMock: {
    getTotalXp: ReturnType<typeof vi.fn>
    getStreakCurrent: ReturnType<typeof vi.fn>
  }
  let coreClientMock: { getTotalCompletedLessons: ReturnType<typeof vi.fn> }
  let service: AchievementsService

  beforeEach(() => {
    prismaMock = {
      achievement: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      userAchievement: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
    }
    gamificationClientMock = {
      getTotalXp: vi.fn().mockResolvedValue(0),
      getStreakCurrent: vi.fn().mockResolvedValue(0),
    }
    coreClientMock = {
      getTotalCompletedLessons: vi.fn().mockResolvedValue(0),
    }
    service = new AchievementsService(
      prismaMock as unknown as PrismaService,
      gamificationClientMock as unknown as GamificationClientService,
      coreClientMock as unknown as CoreClientService,
    )
  })

  describe("listAchievements", () => {
    it("pagina o catálogo com skip/take e retorna o total geral", async () => {
      prismaMock.achievement.findMany.mockResolvedValue([
        {
          slug: "xp-100",
          title: "Acendendo a chama",
          description: "desc",
          iconUrl: null,
          ruleType: "TOTAL_XP",
          threshold: 100,
        },
      ])
      prismaMock.achievement.count.mockResolvedValue(10)

      const page = await service.listAchievements(4, 8)

      expect(prismaMock.achievement.findMany).toHaveBeenCalledWith({
        orderBy: { threshold: "asc" },
        skip: 8,
        take: 4,
      })
      expect(page).toEqual({
        achievements: [
          {
            slug: "xp-100",
            title: "Acendendo a chama",
            description: "desc",
            iconUrl: "",
            ruleType: "TOTAL_XP",
            threshold: 100,
          },
        ],
        total: 10,
      })
    })
  })

  describe("getUserAchievements", () => {
    it("lança INVALID_USER_CODE quando userCode é vazio, sem consultar o banco", async () => {
      await expect(service.getUserAchievements("", 10, 0)).rejects.toThrow()
      expect(prismaMock.achievement.findMany).not.toHaveBeenCalled()
    })

    it("calcula progresso/unlocked por ruleType (LESSONS_COMPLETED via Core, TOTAL_XP e STREAK_DAYS via Gamification), limita ao threshold e propaga total/unlockedTotal", async () => {
      const unlockedAt = new Date("2026-05-11T20:30:06.000Z")
      prismaMock.achievement.findMany.mockResolvedValue([
        {
          id: 1n,
          slug: "first-lesson",
          title: "Primeiro passo",
          description: "desc",
          iconUrl: null,
          ruleType: "LESSONS_COMPLETED",
          threshold: 1,
        },
        {
          id: 2n,
          slug: "ten-lessons",
          title: "Maratonista",
          description: "desc",
          iconUrl: null,
          ruleType: "LESSONS_COMPLETED",
          threshold: 10,
        },
        {
          id: 3n,
          slug: "xp-100",
          title: "Acendendo a chama",
          description: "desc",
          iconUrl: null,
          ruleType: "TOTAL_XP",
          threshold: 100,
        },
        {
          id: 4n,
          slug: "streak-30",
          title: "Chama eterna",
          description: "desc",
          iconUrl: null,
          ruleType: "STREAK_DAYS",
          threshold: 30,
        },
      ])
      prismaMock.achievement.count.mockResolvedValue(4)
      prismaMock.userAchievement.count.mockResolvedValue(1)
      coreClientMock.getTotalCompletedLessons.mockResolvedValue(1)
      gamificationClientMock.getTotalXp.mockResolvedValue(500)
      gamificationClientMock.getStreakCurrent.mockResolvedValue(3)
      prismaMock.userAchievement.findMany.mockResolvedValue([
        { achievementId: 1n, unlockedAt },
      ])

      const page = await service.getUserAchievements("usr1", 10, 0)

      expect(coreClientMock.getTotalCompletedLessons).toHaveBeenCalledWith(
        "usr1",
      )
      expect(prismaMock.userAchievement.findMany).toHaveBeenCalledWith({
        where: { userCode: "usr1", achievementId: { in: [1n, 2n, 3n, 4n] } },
      })
      expect(page.total).toBe(4)
      expect(page.unlockedTotal).toBe(1)
      expect(page.entries).toEqual([
        expect.objectContaining({
          slug: "first-lesson",
          unlocked: true,
          unlockedAt: unlockedAt.toISOString(),
          progress: 1, // total real de lições concluídas (Core)=1, capado no threshold=1
        }),
        expect.objectContaining({
          slug: "ten-lessons",
          unlocked: false,
          unlockedAt: "",
          progress: 1, // mesmo total (1), abaixo do threshold=10
        }),
        expect.objectContaining({
          slug: "xp-100",
          unlocked: false,
          progress: 100, // XP=500 capado no threshold=100
        }),
        expect.objectContaining({
          slug: "streak-30",
          unlocked: false,
          progress: 3, // streak atual, abaixo do threshold=30
        }),
      ])
    })

    it("não consulta desbloqueios quando a página de conquistas está vazia", async () => {
      prismaMock.achievement.findMany.mockResolvedValue([])

      const page = await service.getUserAchievements("usr1", 10, 20)

      expect(prismaMock.userAchievement.findMany).not.toHaveBeenCalled()
      expect(page.entries).toEqual([])
    })
  })
})
