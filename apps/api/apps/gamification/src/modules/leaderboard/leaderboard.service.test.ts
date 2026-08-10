import type { RedisService } from "@mio/redis"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CoreClientService } from "../core-client/core-client.service"
import type { PrismaService } from "../prisma/prisma.service"
import {
  calculateCompositeScore,
  extractXpFromScore,
  LeaderboardService,
} from "./leaderboard.service"

describe("LeaderboardService", () => {
  let redisMock: {
    zaddGreater: ReturnType<typeof vi.fn>
    zrevrank1Based: ReturnType<typeof vi.fn>
    zrevrangeWithScores: ReturnType<typeof vi.fn>
    zcard: ReturnType<typeof vi.fn>
  }
  let coreClientMock: {
    batchGetUsers: ReturnType<typeof vi.fn>
  }
  let prismaMock: {
    userXp: {
      findMany: ReturnType<typeof vi.fn>
      findUnique: ReturnType<typeof vi.fn>
      count: ReturnType<typeof vi.fn>
      upsert: ReturnType<typeof vi.fn>
    }
    xpTransaction: {
      findFirst: ReturnType<typeof vi.fn>
      upsert: ReturnType<typeof vi.fn>
    }
  }
  let service: LeaderboardService

  beforeEach(() => {
    redisMock = {
      zaddGreater: vi.fn().mockResolvedValue(undefined),
      zrevrank1Based: vi.fn(),
      zrevrangeWithScores: vi.fn(),
      zcard: vi.fn().mockResolvedValue(0),
    }
    coreClientMock = {
      batchGetUsers: vi.fn().mockResolvedValue([]),
    }
    prismaMock = {
      userXp: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(0),
        upsert: vi.fn().mockResolvedValue({}),
      },
      xpTransaction: {
        findFirst: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
    }
    service = new LeaderboardService(
      redisMock as unknown as RedisService,
      coreClientMock as unknown as CoreClientService,
      prismaMock as unknown as PrismaService,
    )
  })

  describe("calculateCompositeScore & extractXpFromScore", () => {
    it("mantém a parte inteira idêntica ao total de XP", () => {
      const score = calculateCompositeScore(500, 1770000000000)
      expect(Math.floor(score)).toBe(500)
      expect(extractXpFromScore(score)).toBe(500)
    })

    it("desempata a favor de quem alcançou a pontuação primeiro (menor timestamp = maior score)", () => {
      const timestampAna = 1770000000000 // 14:00
      const timestampCarlos = 1770000300000 // 14:05 (posterior)

      const scoreAna = calculateCompositeScore(500, timestampAna)
      const scoreCarlos = calculateCompositeScore(500, timestampCarlos)

      // Ana alcançou primeiro, então seu score decimal no Redis é maior
      expect(scoreAna).toBeGreaterThan(scoreCarlos)
      expect(extractXpFromScore(scoreAna)).toBe(500)
      expect(extractXpFromScore(scoreCarlos)).toBe(500)
    })

    it("maior XP sempre vence independente do timestamp", () => {
      const scoreMenorXp = calculateCompositeScore(500, 1000000000000)
      const scoreMaiorXp = calculateCompositeScore(550, 2000000000000)

      expect(scoreMaiorXp).toBeGreaterThan(scoreMenorXp)
    })
  })

  it("updateScore executa zaddGreater com o score composto", async () => {
    const fixedTime = 1770000000000
    await service.updateScore("usr1", 250, fixedTime)

    const expectedScore = calculateCompositeScore(250, fixedTime)
    expect(redisMock.zaddGreater).toHaveBeenCalledWith(
      "mio:xp:global",
      expectedScore,
      "usr1",
    )
  })

  describe("getUserRank", () => {
    it("retorna posição 1-based quando rank é encontrado", async () => {
      redisMock.zrevrank1Based.mockResolvedValue(1)
      const rank = await service.getUserRank("usr1")
      expect(rank).toBe(1)
    })

    it("retorna 0 quando usuário não está no ranking e não tem XP no Postgres", async () => {
      redisMock.zrevrank1Based.mockResolvedValue(0)
      const rank = await service.getUserRank("ghost")
      expect(rank).toBe(0)
    })

    it("reconstrói o ranking no Redis a partir do Postgres se não encontrado", async () => {
      redisMock.zrevrank1Based.mockResolvedValueOnce(0).mockResolvedValueOnce(3)
      prismaMock.userXp.findMany.mockResolvedValue([
        { userCode: "usr1", total: 300 },
      ])

      const rank = await service.getUserRank("usr1")

      expect(rank).toBe(3)
      expect(prismaMock.userXp.findMany).toHaveBeenCalled()
      expect(redisMock.zaddGreater).toHaveBeenCalled()
    })
  })

  describe("rebuildFromDatabase", () => {
    it("reconstrói o ranking no Redis a partir do Postgres", async () => {
      prismaMock.userXp.findMany.mockResolvedValue([
        { userCode: "u1", total: 500 },
        { userCode: "u2", total: 1000 },
      ])
      prismaMock.xpTransaction.findFirst.mockResolvedValue({
        createdAt: new Date("2026-05-11T20:00:00Z"),
      })

      const count = await service.rebuildFromDatabase()

      expect(count).toBe(2)
      expect(redisMock.zaddGreater).toHaveBeenCalledTimes(2)
    })
  })

  describe("getLeaderboard", () => {
    it("retorna lista vazia se redis e postgres não tiverem registros", async () => {
      redisMock.zrevrangeWithScores.mockResolvedValue([])
      redisMock.zcard.mockResolvedValue(0)
      prismaMock.userXp.findMany.mockResolvedValue([])

      const result = await service.getLeaderboard(10, 0)
      expect(result.entries).toEqual([])
      expect(result.totalUsers).toBe(0)
      expect(coreClientMock.batchGetUsers).not.toHaveBeenCalled()
    })

    it("consulta redis, remove decimais de desempate e enriquece com dados cadastrais do Core", async () => {
      const scoreAna = calculateCompositeScore(600, 1770000000000)
      const scoreCarlos = calculateCompositeScore(200, 1770000500000)

      redisMock.zrevrangeWithScores.mockResolvedValue([
        { member: "usr1", score: scoreAna },
        { member: "usr2", score: scoreCarlos },
      ])
      redisMock.zcard.mockResolvedValue(2)

      coreClientMock.batchGetUsers.mockResolvedValue([
        { code: "usr1", name: "Alice", avatarUrl: "https://avatar1.png" },
        { code: "usr2", name: "Bob", avatarUrl: "" },
      ])

      const result = await service.getLeaderboard(10, 0)

      expect(redisMock.zrevrangeWithScores).toHaveBeenCalledWith(
        "mio:xp:global",
        0,
        9,
      )
      expect(coreClientMock.batchGetUsers).toHaveBeenCalledWith([
        "usr1",
        "usr2",
      ])

      expect(result.totalUsers).toBe(2)
      expect(result.entries).toHaveLength(2)

      // Confirma que os pontos retornados na DTO são os inteiros 600 e 200 (sem resíduos decimais)
      expect(result.entries[0]).toEqual({
        userCode: "usr1",
        name: "Alice",
        avatarUrl: "https://avatar1.png",
        total: 600,
        rank: 1,
        level: "JUNIOR",
      })

      expect(result.entries[1]).toEqual({
        userCode: "usr2",
        name: "Bob",
        avatarUrl: "",
        total: 200,
        rank: 2,
        level: "INICIANTE",
      })
    })

    it("aplica nome padrão 'Aluno' se usuário não for retornado pelo Core", async () => {
      const score = calculateCompositeScore(50, 1770000000000)
      redisMock.zrevrangeWithScores.mockResolvedValue([
        { member: "usr99", score },
      ])
      redisMock.zcard.mockResolvedValue(1)
      coreClientMock.batchGetUsers.mockResolvedValue([])

      const result = await service.getLeaderboard(10, 0)
      expect(result.entries[0]?.name).toBe("Aluno")
      expect(result.entries[0]?.total).toBe(50)
      expect(result.entries[0]?.level).toBe("LEIGO")
    })
  })
})
