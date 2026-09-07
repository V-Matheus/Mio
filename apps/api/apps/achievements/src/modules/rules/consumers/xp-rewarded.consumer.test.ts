import { beforeEach, describe, expect, it, vi } from "vitest"
import type { RulesEngineService } from "../rules-engine.service"
import {
  XpRewardedConsumer,
  type XpRewardedMessagePayload,
} from "./xp-rewarded.consumer"

describe("XpRewardedConsumer", () => {
  let rulesMock: {
    evaluateTotalXp: ReturnType<typeof vi.fn>
    evaluateStreakDays: ReturnType<typeof vi.fn>
  }
  let consumer: XpRewardedConsumer

  beforeEach(() => {
    rulesMock = {
      evaluateTotalXp: vi.fn().mockResolvedValue(undefined),
      evaluateStreakDays: vi.fn().mockResolvedValue(undefined),
    }
    consumer = new XpRewardedConsumer(
      rulesMock as unknown as RulesEngineService,
    )
  })

  it("avalia TOTAL_XP e STREAK_DAYS quando streakCurrent é informado", async () => {
    const payload: XpRewardedMessagePayload = {
      userCode: "usr123",
      totalAfter: 500,
      streakCurrent: 3,
    }

    await consumer.handleMessage(payload)

    expect(rulesMock.evaluateTotalXp).toHaveBeenCalledWith("usr123", 500)
    expect(rulesMock.evaluateStreakDays).toHaveBeenCalledWith("usr123", 3)
  })

  it("avalia apenas TOTAL_XP quando streakCurrent está ausente (evento legado)", async () => {
    const payload: XpRewardedMessagePayload = {
      userCode: "usr123",
      totalAfter: 500,
    }

    await consumer.handleMessage(payload)

    expect(rulesMock.evaluateTotalXp).toHaveBeenCalledWith("usr123", 500)
    expect(rulesMock.evaluateStreakDays).not.toHaveBeenCalled()
  })

  it("descarta payload sem userCode ou com totalAfter não numérico sem avaliar nenhuma regra", async () => {
    await consumer.handleMessage({
      userCode: "",
      totalAfter: 500,
    } as XpRewardedMessagePayload)
    await consumer.handleMessage({
      userCode: "usr123",
      totalAfter: "500",
    } as unknown as XpRewardedMessagePayload)

    expect(rulesMock.evaluateTotalXp).not.toHaveBeenCalled()
    expect(rulesMock.evaluateStreakDays).not.toHaveBeenCalled()
  })
})
