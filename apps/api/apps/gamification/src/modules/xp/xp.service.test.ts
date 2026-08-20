import { beforeEach, describe, expect, it, vi } from "vitest"
import type { LeaderboardService } from "../leaderboard/leaderboard.service"
import type { PrismaService } from "../prisma/prisma.service"
import type { XpEventsPublisher } from "./events/xp-events.publisher"
import type { XpRulesService } from "./rules/xp-rules.service"
import { XpService } from "./xp.service"

describe("XpService", () => {
  let prismaMock: {
    xpTransaction: {
      findUnique: ReturnType<typeof vi.fn>
      findMany: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
    }
    userXp: {
      findUnique: ReturnType<typeof vi.fn>
      upsert: ReturnType<typeof vi.fn>
    }
    userStreak: {
      findUnique: ReturnType<typeof vi.fn>
      upsert: ReturnType<typeof vi.fn>
    }
    $transaction: ReturnType<typeof vi.fn>
  }
  let leaderboardMock: {
    updateScore: ReturnType<typeof vi.fn>
    getUserRank: ReturnType<typeof vi.fn>
  }
  let eventsMock: {
    xpRewarded: ReturnType<typeof vi.fn>
  }
  let rulesMock: {
    getAmount: ReturnType<typeof vi.fn>
  }
  let service: XpService

  beforeEach(() => {
    prismaMock = {
      xpTransaction: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
      userXp: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      userStreak: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    }
    leaderboardMock = {
      updateScore: vi.fn().mockResolvedValue(undefined),
      getUserRank: vi.fn().mockResolvedValue(1),
    }
    eventsMock = {
      xpRewarded: vi.fn().mockResolvedValue(undefined),
    }
    rulesMock = {
      getAmount: vi.fn().mockResolvedValue(50),
    }

    service = new XpService(
      prismaMock as unknown as PrismaService,
      leaderboardMock as unknown as LeaderboardService,
      eventsMock as unknown as XpEventsPublisher,
      rulesMock as unknown as XpRulesService,
    )
  })

  describe("rewardLessonCompleted", () => {
    it("credita 50 XP, insere transação, publica evento e sincroniza Redis", async () => {
      prismaMock.xpTransaction.findUnique.mockResolvedValue(null)
      prismaMock.userXp.upsert.mockResolvedValue({
        userCode: "usr1",
        total: 50,
      })

      const result = await service.rewardLessonCompleted("usr1", 42)

      expect(result).toEqual({ total: 50, newlyAwarded: true })
      expect(prismaMock.xpTransaction.create).toHaveBeenCalledWith({
        data: {
          userCode: "usr1",
          amount: 50,
          reason: "lesson.completed",
          sourceId: "lesson:42",
          createdAt: expect.any(Date),
        },
      })
      expect(prismaMock.userStreak.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userCode: "usr1" },
          create: expect.objectContaining({
            userCode: "usr1",
            streakCurrent: 1,
            streakBest: 1,
          }),
        }),
      )
      expect(prismaMock.userXp.upsert).toHaveBeenCalledWith({
        where: { userCode: "usr1" },
        create: { userCode: "usr1", total: 50 },
        update: { total: { increment: 50 } },
      })
      expect(eventsMock.xpRewarded).toHaveBeenCalledWith(
        expect.objectContaining({
          userCode: "usr1",
          amount: 50,
          sourceId: "lesson:42",
          totalAfter: 50,
          level: "LEIGO",
        }),
        expect.anything(),
      )
      expect(leaderboardMock.updateScore).toHaveBeenCalledWith("usr1", 50)
    })

    it("idempotência: não duplica XP se transação para a mesma aula já existir, mas sincroniza/repara o Redis", async () => {
      prismaMock.xpTransaction.findUnique.mockResolvedValue({ id: 10n })
      prismaMock.userXp.findUnique.mockResolvedValue({
        userCode: "usr1",
        total: 100,
      })

      const result = await service.rewardLessonCompleted("usr1", 42)

      expect(result).toEqual({ total: 100, newlyAwarded: false })
      expect(prismaMock.xpTransaction.create).not.toHaveBeenCalled()
      expect(prismaMock.userXp.upsert).not.toHaveBeenCalled()
      expect(eventsMock.xpRewarded).not.toHaveBeenCalled()
      expect(leaderboardMock.updateScore).toHaveBeenCalledWith("usr1", 100)
    })

    it("repara o Redis quando uma entrega anterior falha na sincronização e é reentregue", async () => {
      // 1ª Entrega: banco comita com sucesso, mas a sincronização com o Redis falha
      prismaMock.xpTransaction.findUnique.mockResolvedValueOnce(null)
      prismaMock.userXp.upsert.mockResolvedValueOnce({
        userCode: "usr1",
        total: 50,
      })
      leaderboardMock.updateScore.mockRejectedValueOnce(
        new Error("Redis connection failure"),
      )

      await expect(service.rewardLessonCompleted("usr1", 42)).rejects.toThrow(
        "Redis connection failure",
      )

      expect(prismaMock.xpTransaction.create).toHaveBeenCalledTimes(1)
      prismaMock.xpTransaction.create.mockClear()

      // 2ª Entrega (retry/redelivery): transação já existe no banco, agora sincroniza o Redis com sucesso
      prismaMock.xpTransaction.findUnique.mockResolvedValueOnce({ id: 10n })
      prismaMock.userXp.findUnique.mockResolvedValueOnce({
        userCode: "usr1",
        total: 50,
      })
      leaderboardMock.updateScore.mockResolvedValueOnce(undefined)

      const redeliveryResult = await service.rewardLessonCompleted("usr1", 42)

      expect(redeliveryResult).toEqual({ total: 50, newlyAwarded: false })
      expect(prismaMock.xpTransaction.create).not.toHaveBeenCalled()
      expect(leaderboardMock.updateScore).toHaveBeenLastCalledWith("usr1", 50)
    })
  })

  describe("getUserXp", () => {
    it("retorna detalhes de XP, nível e rank", async () => {
      prismaMock.userXp.findUnique.mockResolvedValue({
        userCode: "usr1",
        total: 300,
      })
      leaderboardMock.getUserRank.mockResolvedValue(5)

      const result = await service.getUserXp("usr1")

      expect(result).toEqual({
        total: 300,
        level: "INICIANTE",
        progressToNext: 50,
        xpToNextLevel: 200,
        rank: 5,
      })
    })

    it("usuário não encontrado retorna total 0, LEIGO e rank 0", async () => {
      prismaMock.userXp.findUnique.mockResolvedValue(null)
      leaderboardMock.getUserRank.mockResolvedValue(0)

      const result = await service.getUserXp("ghost")

      expect(result).toEqual({
        total: 0,
        level: "LEIGO",
        progressToNext: 0,
        xpToNextLevel: 100,
        rank: 0,
      })
    })

    it("lança USER_NOT_FOUND se o userCode for vazio", async () => {
      await expect(service.getUserXp("")).rejects.toThrow()
    })
  })

  describe("getWeeklyXp", () => {
    it("retorna array com os 7 dias da semana e total calculado", async () => {
      const fixedWednesday = new Date("2026-08-19T14:00:00.000Z")
      prismaMock.xpTransaction.findMany.mockResolvedValue([
        {
          amount: 50,
          createdAt: new Date("2026-08-17T10:00:00.000Z"), // Seg
        },
        {
          amount: 100,
          createdAt: new Date("2026-08-17T18:00:00.000Z"), // Seg
        },
        {
          amount: 50,
          createdAt: new Date("2026-08-19T11:00:00.000Z"), // Qua
        },
      ])

      const result = await service.getWeeklyXp("usr1", fixedWednesday)

      expect(result.days).toHaveLength(7)
      expect(result.days[0]).toEqual({
        day: "Seg",
        date: "2026-08-17",
        xp: 150,
      })
      expect(result.days[1]).toEqual({
        day: "Ter",
        date: "2026-08-18",
        xp: 0,
      })
      expect(result.days[2]).toEqual({
        day: "Qua",
        date: "2026-08-19",
        xp: 50,
      })
      expect(result.totalWeeklyXp).toBe(200)
    })
  })

  describe("getUserGamificationProfile", () => {
    it("agrega XP, rank, streak efetivo e weekly XP", async () => {
      prismaMock.userXp.findUnique.mockResolvedValue({
        userCode: "usr1",
        total: 1200,
      })
      leaderboardMock.getUserRank.mockResolvedValue(3)
      prismaMock.userStreak.findUnique.mockResolvedValue({
        userCode: "usr1",
        streakCurrent: 5,
        streakBest: 10,
        lastStudyDate: new Date(),
      })

      const profile = await service.getUserGamificationProfile("usr1")

      expect(profile.total).toBe(1200)
      expect(profile.level).toBe("JUNIOR")
      expect(profile.rank).toBe(3)
      expect(profile.streak.streakCurrent).toBe(5)
      expect(profile.streak.streakBest).toBe(10)
      expect(profile.weeklyXp.days).toHaveLength(7)
    })
  })
})
