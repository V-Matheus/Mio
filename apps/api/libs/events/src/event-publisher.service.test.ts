import { beforeEach, describe, expect, it, vi } from "vitest"
import { LessonCompletedEvent } from "./domain-event"
import { EventPublisherService } from "./event-publisher.service"

describe("EventPublisherService", () => {
  let outboxPublisherMock: {
    trigger: ReturnType<typeof vi.fn>
  }
  let service: EventPublisherService

  beforeEach(() => {
    outboxPublisherMock = {
      trigger: vi.fn(),
    }
    service = new EventPublisherService(outboxPublisherMock as never)
  })

  it("salva o evento na outbox e dispara trigger reativo no próximo tick", async () => {
    const clientMock = {
      outboxEvent: {
        create: vi.fn().mockResolvedValue({}),
      },
    }

    const event = new LessonCompletedEvent({
      userCode: "u1",
      trackSlug: "ts",
      lessonSlug: "ls",
      lessonId: "1",
      trackId: "2",
      completedAt: "2026-01-01T00:00:00.000Z",
    })

    await service.publish(event, { client: clientMock })

    expect(clientMock.outboxEvent.create).toHaveBeenCalledWith({
      data: {
        routingKey: "lesson.completed",
        payload: event.payload,
        headers: {
          "x-event-version": 1,
          "content-type": "application/json",
        },
      },
    })

    // Aguarda o tick do setImmediate para verificar o disparo reativo
    await new Promise((resolve) => setImmediate(resolve))
    expect(outboxPublisherMock.trigger).toHaveBeenCalled()
  })
})
