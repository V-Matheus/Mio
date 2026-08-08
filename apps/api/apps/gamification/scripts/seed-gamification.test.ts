import type { PrismaClient } from ".prisma/gamification"
import { describe, expect, it, vi } from "vitest"
import {
  DEMO_USERS_XP,
  INITIAL_XP_RULES,
  seedDemoUserXp,
  seedGamificationRules,
} from "./seed-gamification"

describe("seedGamificationRules", () => {
  it("mapeia todas as regras de XP no banco via upsert idempotente", async () => {
    const prismaMock = {
      xpRule: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    }

    const count = await seedGamificationRules(
      prismaMock as unknown as PrismaClient,
    )

    expect(count).toBe(INITIAL_XP_RULES.length)
    expect(prismaMock.xpRule.upsert).toHaveBeenCalledTimes(
      INITIAL_XP_RULES.length,
    )

    for (const rule of INITIAL_XP_RULES) {
      expect(prismaMock.xpRule.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: rule.key },
          create: expect.objectContaining({
            key: rule.key,
            amount: rule.amount,
            description: rule.description,
          }),
        }),
      )
    }
  })

  it("mapeia xps dos alunos de demonstração no banco e sincroniza com Redis", async () => {
    const prismaMock = {
      userXp: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      xpTransaction: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    }
    const redisMock = {
      zadd: vi.fn().mockResolvedValue(1),
    }

    const count = await seedDemoUserXp(
      prismaMock as unknown as PrismaClient,
      redisMock as never,
    )

    expect(count).toBe(DEMO_USERS_XP.length)
    expect(prismaMock.userXp.upsert).toHaveBeenCalledTimes(DEMO_USERS_XP.length)
    expect(prismaMock.xpTransaction.upsert).toHaveBeenCalledTimes(
      DEMO_USERS_XP.length,
    )
    expect(redisMock.zadd).toHaveBeenCalledTimes(DEMO_USERS_XP.length)
  })
})
