import { beforeEach, describe, expect, it, vi } from "vitest"
import { OutboxPublisherService } from "./outbox-publisher.service"

describe("OutboxPublisherService", () => {
  let prismaMock: {
    outboxEvent: {
      findMany: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
    }
  }
  let service: OutboxPublisherService

  beforeEach(() => {
    prismaMock = {
      outboxEvent: {
        findMany: vi.fn(),
        update: vi.fn(),
      },
    }
    service = new OutboxPublisherService(prismaMock as never)
  })

  it("retorna 0 se não houver eventos pendentes", async () => {
    prismaMock.outboxEvent.findMany.mockResolvedValue([])

    const count = await service.publishPendingEvents()

    expect(count).toBe(0)
    expect(prismaMock.outboxEvent.findMany).toHaveBeenCalledWith({
      where: { publishedAt: null },
      orderBy: { createdAt: "asc" },
      take: 50,
    })
  })

  it("marca eventos como publicados mesmo sem RabbitMQ configurado", async () => {
    const event = {
      id: BigInt(1),
      routingKey: "lesson.completed",
      payload: { userCode: "abc" },
      headers: { "x-event-version": 1 },
      createdAt: new Date(),
      publishedAt: null,
    }
    prismaMock.outboxEvent.findMany.mockResolvedValue([event])
    prismaMock.outboxEvent.update.mockResolvedValue({})

    const count = await service.publishPendingEvents()

    expect(count).toBe(1)
    expect(prismaMock.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: BigInt(1) },
      data: { publishedAt: expect.any(Date) },
    })
  })
})
