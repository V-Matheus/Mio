import { beforeEach, describe, expect, it, vi } from "vitest"
import type { XpService } from "../xp.service"
import {
  AchievementUnlockedConsumer,
  type AchievementUnlockedMessagePayload,
} from "./achievement-unlocked.consumer"

describe("AchievementUnlockedConsumer", () => {
  let xpServiceMock: { rewardAchievementUnlocked: ReturnType<typeof vi.fn> }
  let consumer: AchievementUnlockedConsumer

  beforeEach(() => {
    xpServiceMock = {
      rewardAchievementUnlocked: vi
        .fn()
        .mockResolvedValue({ total: 125, newlyAwarded: true }),
    }
    consumer = new AchievementUnlockedConsumer(
      xpServiceMock as unknown as XpService,
    )
  })

  it("credita o xpReward via rewardAchievementUnlocked quando a conquista tem bônus de XP", async () => {
    const payload: AchievementUnlockedMessagePayload = {
      userCode: "usr123",
      achievementSlug: "first-lesson",
      xpReward: 25,
    }

    await consumer.handleMessage(payload)

    expect(xpServiceMock.rewardAchievementUnlocked).toHaveBeenCalledWith(
      "usr123",
      "first-lesson",
      25,
    )
  })

  it("não credita XP quando xpReward é 0 ou ausente (conquista sem bônus)", async () => {
    await consumer.handleMessage({
      userCode: "usr123",
      achievementSlug: "no-reward",
      xpReward: 0,
    })
    await consumer.handleMessage({
      userCode: "usr123",
      achievementSlug: "no-reward-legacy",
    })

    expect(xpServiceMock.rewardAchievementUnlocked).not.toHaveBeenCalled()
  })

  it("descarta payload sem userCode ou achievementSlug sem chamar o serviço", async () => {
    await consumer.handleMessage({
      userCode: "",
      achievementSlug: "first-lesson",
      xpReward: 25,
    })
    await consumer.handleMessage({
      userCode: "usr123",
      achievementSlug: "",
      xpReward: 25,
    })

    expect(xpServiceMock.rewardAchievementUnlocked).not.toHaveBeenCalled()
  })
})
