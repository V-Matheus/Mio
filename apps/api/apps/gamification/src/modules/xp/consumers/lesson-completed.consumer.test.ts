import { beforeEach, describe, expect, it, vi } from "vitest"
import type { XpService } from "../xp.service"
import { LessonCompletedConsumer } from "./lesson-completed.consumer"

describe("LessonCompletedConsumer", () => {
  let xpServiceMock: {
    rewardLessonCompleted: ReturnType<typeof vi.fn>
  }
  let consumer: LessonCompletedConsumer

  beforeEach(() => {
    xpServiceMock = {
      rewardLessonCompleted: vi
        .fn()
        .mockResolvedValue({ total: 50, newlyAwarded: true }),
    }
    consumer = new LessonCompletedConsumer(
      xpServiceMock as unknown as XpService,
    )
  })

  it("processa mensagem válida e chama rewardLessonCompleted", async () => {
    const payload = {
      userCode: "usr123",
      lessonId: "42",
      trackSlug: "front-end",
    }

    await consumer.handleMessage(payload)

    expect(xpServiceMock.rewardLessonCompleted).toHaveBeenCalledWith(
      "usr123",
      "42",
    )
  })

  it("descarta payload sem userCode ou lessonId sem chamar rewardLessonCompleted", async () => {
    const payload = {
      userCode: "",
      lessonId: "",
    }

    await consumer.handleMessage(payload)

    expect(xpServiceMock.rewardLessonCompleted).not.toHaveBeenCalled()
  })
})
