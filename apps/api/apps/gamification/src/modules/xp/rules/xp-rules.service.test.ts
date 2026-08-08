import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PrismaService } from "../../prisma/prisma.service"
import { DEFAULT_XP_RULES, XpRuleKey, XpRulesService } from "./xp-rules.service"

describe("XpRulesService", () => {
  let prismaMock: {
    xpRule: {
      findUnique: ReturnType<typeof vi.fn>
      upsert: ReturnType<typeof vi.fn>
      findMany: ReturnType<typeof vi.fn>
    }
  }
  let service: XpRulesService

  beforeEach(() => {
    prismaMock = {
      xpRule: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        findMany: vi.fn(),
      },
    }
    service = new XpRulesService(prismaMock as unknown as PrismaService)
  })

  describe("getAmount", () => {
    it("retorna o valor configurado no banco se existir", async () => {
      prismaMock.xpRule.findUnique.mockResolvedValue({
        key: XpRuleKey.LESSON_COMPLETED,
        amount: 75,
      })

      const amount = await service.getAmount(XpRuleKey.LESSON_COMPLETED)
      expect(amount).toBe(75)
    })

    it("retorna o valor padrão se a regra não estiver no banco", async () => {
      prismaMock.xpRule.findUnique.mockResolvedValue(null)

      const amount = await service.getAmount(XpRuleKey.LESSON_COMPLETED)
      expect(amount).toBe(DEFAULT_XP_RULES.LESSON_COMPLETED.amount)
    })

    it("retorna 0 para chave desconhecida sem registro", async () => {
      prismaMock.xpRule.findUnique.mockResolvedValue(null)

      const amount = await service.getAmount("UNKNOWN_REASON")
      expect(amount).toBe(0)
    })
  })

  describe("setAmount", () => {
    it("atualiza ou cria a regra no banco", async () => {
      prismaMock.xpRule.upsert.mockResolvedValue({
        key: XpRuleKey.TRACK_COMPLETED,
        amount: 300,
        description: "XP de trilha",
      })

      const res = await service.setAmount(
        XpRuleKey.TRACK_COMPLETED,
        300,
        "XP de trilha",
      )
      expect(res).toEqual({
        key: XpRuleKey.TRACK_COMPLETED,
        amount: 300,
        description: "XP de trilha",
      })
      expect(prismaMock.xpRule.upsert).toHaveBeenCalledWith({
        where: { key: XpRuleKey.TRACK_COMPLETED },
        create: {
          key: XpRuleKey.TRACK_COMPLETED,
          amount: 300,
          description: "XP de trilha",
        },
        update: {
          amount: 300,
          description: "XP de trilha",
        },
      })
    })
  })

  describe("listRules", () => {
    it("lista todas as regras cadastradas", async () => {
      prismaMock.xpRule.findMany.mockResolvedValue([
        { key: "LESSON_COMPLETED", amount: 50, description: "Aula" },
        { key: "TRACK_COMPLETED", amount: 200, description: "Trilha" },
      ])

      const list = await service.listRules()
      expect(list).toHaveLength(2)
      expect(list[0]?.key).toBe("LESSON_COMPLETED")
      expect(list[1]?.key).toBe("TRACK_COMPLETED")
    })
  })
})
