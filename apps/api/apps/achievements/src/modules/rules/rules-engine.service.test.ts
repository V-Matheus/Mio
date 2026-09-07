import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PrismaService } from "../prisma/prisma.service"
import type { AchievementEventsPublisher } from "./events/achievement-events.publisher"
import { AchievementRuleType, RulesEngineService } from "./rules-engine.service"

describe("RulesEngineService", () => {
  let prismaMock: {
    achievement: { findMany: ReturnType<typeof vi.fn> }
    userAchievement: { create: ReturnType<typeof vi.fn> }
    $transaction: ReturnType<typeof vi.fn>
  }
  let eventsMock: { achievementUnlocked: ReturnType<typeof vi.fn> }
  let service: RulesEngineService

  beforeEach(() => {
    prismaMock = {
      achievement: { findMany: vi.fn().mockResolvedValue([]) },
      userAchievement: { create: vi.fn().mockResolvedValue({}) },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    }
    eventsMock = { achievementUnlocked: vi.fn().mockResolvedValue(undefined) }
    service = new RulesEngineService(
      prismaMock as unknown as PrismaService,
      eventsMock as unknown as AchievementEventsPublisher,
    )
  })

  describe("evaluateLessonsCompleted", () => {
    it("desbloqueia todas as conquistas elegíveis pro total de lições concluídas informado, publicando um achievement.unlocked por conquista", async () => {
      prismaMock.achievement.findMany.mockResolvedValue([
        {
          id: 1n,
          slug: "first-lesson",
          title: "Primeiro passo",
          iconUrl: null,
          xpReward: 25,
        },
        {
          id: 2n,
          slug: "ten-lessons",
          title: "Maratonista",
          iconUrl: "https://cdn/medal.png",
          xpReward: 100,
        },
      ])

      await service.evaluateLessonsCompleted("usr1", 10)

      expect(prismaMock.achievement.findMany).toHaveBeenCalledWith({
        where: {
          ruleType: AchievementRuleType.LESSONS_COMPLETED,
          threshold: { lte: 10 },
          unlocks: { none: { userCode: "usr1" } },
        },
      })
      expect(prismaMock.userAchievement.create).toHaveBeenCalledTimes(2)
      expect(prismaMock.userAchievement.create).toHaveBeenCalledWith({
        data: { userCode: "usr1", achievementId: 1n },
      })
      expect(eventsMock.achievementUnlocked).toHaveBeenCalledTimes(2)
      expect(eventsMock.achievementUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          userCode: "usr1",
          achievementSlug: "first-lesson",
          title: "Primeiro passo",
          iconUrl: "",
          xpReward: 25,
        }),
        { client: prismaMock },
      )
      expect(eventsMock.achievementUnlocked).toHaveBeenCalledWith(
        expect.objectContaining({
          achievementSlug: "ten-lessons",
          iconUrl: "https://cdn/medal.png",
          xpReward: 100,
        }),
        { client: prismaMock },
      )
    })

    it("reprocessar o mesmo total de lições (reentrega do broker) é inofensivo: não duplica desbloqueios já existentes", async () => {
      // a conquista já não é retornada como elegível porque `unlocks: { none }` a exclui —
      // simula o estado real após o primeiro processamento bem-sucedido.
      prismaMock.achievement.findMany.mockResolvedValue([])

      await service.evaluateLessonsCompleted("usr1", 10)
      await service.evaluateLessonsCompleted("usr1", 10)

      expect(prismaMock.userAchievement.create).not.toHaveBeenCalled()
      expect(eventsMock.achievementUnlocked).not.toHaveBeenCalled()
    })

    it("idempotência: reentrega concorrente que colide no @@unique([userCode, achievementId]) (P2002) é ignorada silenciosamente, sem publicar evento", async () => {
      prismaMock.achievement.findMany.mockResolvedValue([
        {
          id: 1n,
          slug: "first-lesson",
          title: "Primeiro passo",
          iconUrl: null,
          xpReward: 25,
        },
      ])
      prismaMock.userAchievement.create.mockRejectedValue({ code: "P2002" })

      await expect(
        service.evaluateLessonsCompleted("usr1", 1),
      ).resolves.toBeUndefined()

      expect(eventsMock.achievementUnlocked).not.toHaveBeenCalled()
    })

    it("propaga erros inesperados (não P2002) do desbloqueio sem publicar o evento", async () => {
      prismaMock.achievement.findMany.mockResolvedValue([
        {
          id: 1n,
          slug: "first-lesson",
          title: "Primeiro passo",
          iconUrl: null,
          xpReward: 0,
        },
      ])
      prismaMock.userAchievement.create.mockRejectedValue(
        new Error("connection lost"),
      )

      await expect(service.evaluateLessonsCompleted("usr1", 1)).rejects.toThrow(
        "connection lost",
      )
      expect(eventsMock.achievementUnlocked).not.toHaveBeenCalled()
    })
  })

  describe("evaluateTotalXp e evaluateStreakDays", () => {
    it("consultam achievements pelo ruleType e threshold correspondentes a cada regra", async () => {
      await service.evaluateTotalXp("usr1", 500)

      expect(prismaMock.achievement.findMany).toHaveBeenCalledWith({
        where: {
          ruleType: AchievementRuleType.TOTAL_XP,
          threshold: { lte: 500 },
          unlocks: { none: { userCode: "usr1" } },
        },
      })

      await service.evaluateStreakDays("usr1", 3)

      expect(prismaMock.achievement.findMany).toHaveBeenCalledWith({
        where: {
          ruleType: AchievementRuleType.STREAK_DAYS,
          threshold: { lte: 3 },
          unlocks: { none: { userCode: "usr1" } },
        },
      })
    })
  })
})
