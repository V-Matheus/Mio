import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProgressEventsPublisher } from "./progress-events.publisher"

describe("ProgressEventsPublisher", () => {
  let eventPublisherMock: { publish: ReturnType<typeof vi.fn> }
  let publisher: ProgressEventsPublisher

  beforeEach(() => {
    eventPublisherMock = { publish: vi.fn().mockResolvedValue(undefined) }
    publisher = new ProgressEventsPublisher(eventPublisherMock as never)
  })

  it("dispara lessonCompleted delegando para o EventPublisherService", async () => {
    const payload = {
      userCode: "u1",
      trackSlug: "t1",
      lessonSlug: "l1",
      lessonId: "10",
      trackId: "100",
      completedAt: "2026-08-02T00:00:00.000Z",
    }
    const client = { outboxEvent: { create: vi.fn() } }

    await publisher.lessonCompleted(payload, { client })

    expect(eventPublisherMock.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        routingKey: "lesson.completed",
        payload,
      }),
      { client },
    )
  })
})
