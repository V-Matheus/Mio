import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OutboxPublisherService } from "./outbox-publisher.service"

describe("OutboxPublisherService", () => {
  const originalUrl = process.env.RABBITMQ_URL
  let prismaMock: {
    outboxEvent: {
      findMany: ReturnType<typeof vi.fn>
      updateMany: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
    }
  }
  let service: OutboxPublisherService

  beforeEach(() => {
    prismaMock = {
      outboxEvent: {
        findMany: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn(),
      },
    }
    service = new OutboxPublisherService()
    service.setClient(prismaMock as never)
  })

  afterEach(() => {
    vi.clearAllMocks()
    if (originalUrl === undefined) {
      delete process.env.RABBITMQ_URL
    } else {
      process.env.RABBITMQ_URL = originalUrl
    }
  })

  it("retorna 0 e NÃO altera o banco se o RabbitMQ não estiver conectado/configurado", async () => {
    delete process.env.RABBITMQ_URL

    const count = await service.publishPendingEvents()

    expect(count).toBe(0)
    expect(prismaMock.outboxEvent.findMany).not.toHaveBeenCalled()
    expect(prismaMock.outboxEvent.update).not.toHaveBeenCalled()
  })

  it("publica no RabbitMQ via ConfirmChannel com messageId e x-outbox-id para desduplicacao e marca no banco após confirmação", async () => {
    const event = {
      id: BigInt(100),
      routingKey: "lesson.completed",
      payload: { userCode: "abc" },
      headers: { "x-event-version": 1 },
      createdAt: new Date(),
      publishedAt: null,
    }

    prismaMock.outboxEvent.findMany.mockResolvedValue([event])
    prismaMock.outboxEvent.update.mockResolvedValue({})

    const mockChannel = {
      publish: vi.fn(
        (
          _exchange: string,
          _routingKey: string,
          _content: Buffer,
          _options: unknown,
          cb: (err?: Error | null) => void,
        ) => {
          cb(null)
          return true
        },
      ),
    }

    // biome-ignore lint/suspicious/noExplicitAny: mock de propriedade privada para teste
    ;(service as any).channel = mockChannel

    const count = await service.publishPendingEvents()

    expect(count).toBe(1)
    expect(prismaMock.outboxEvent.updateMany).toHaveBeenCalledWith({
      where: {
        id: BigInt(100),
        publishedAt: null,
      },
      data: {
        publishedAt: new Date(0),
      },
    })
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "mio.events",
      "lesson.completed",
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "application/json",
        persistent: true,
        messageId: "100",
        headers: expect.objectContaining({
          "x-outbox-id": "100",
          "x-event-version": 1,
        }),
      }),
      expect.any(Function),
    )
    expect(prismaMock.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: BigInt(100) },
      data: { publishedAt: expect.any(Date) },
    })
  })

  it("pula o envio se a linha já tiver sido reivindicada por outra réplica (claim count === 0)", async () => {
    const event = {
      id: BigInt(100),
      routingKey: "lesson.completed",
      payload: { userCode: "abc" },
      headers: null,
      createdAt: new Date(),
      publishedAt: null,
    }

    prismaMock.outboxEvent.findMany.mockResolvedValue([event])
    prismaMock.outboxEvent.updateMany.mockResolvedValue({ count: 0 })

    const mockChannel = {
      publish: vi.fn(),
    }

    // biome-ignore lint/suspicious/noExplicitAny: mock de propriedade privada para teste
    ;(service as any).channel = mockChannel

    const count = await service.publishPendingEvents()

    expect(count).toBe(0)
    expect(mockChannel.publish).not.toHaveBeenCalled()
    expect(prismaMock.outboxEvent.update).not.toHaveBeenCalled()
  })

  it("NÃO marca o evento como publicado e incrementa retryCount / grava lastError se a confirmação do RabbitMQ falhar", async () => {
    const event = {
      id: BigInt(2),
      routingKey: "lesson.completed",
      payload: { userCode: "xyz" },
      headers: null,
      retryCount: 0,
      lastError: null,
      createdAt: new Date(),
      publishedAt: null,
    }

    prismaMock.outboxEvent.findMany.mockResolvedValue([event])

    const mockChannel = {
      publish: vi.fn(
        (
          _exchange: string,
          _routingKey: string,
          _content: Buffer,
          _options: unknown,
          cb: (err?: Error | null) => void,
        ) => {
          cb(new Error("NACK ou erro de envio"))
          return false
        },
      ),
    }

    // biome-ignore lint/suspicious/noExplicitAny: mock de propriedade privada para teste
    ;(service as any).channel = mockChannel

    const count = await service.publishPendingEvents()

    expect(count).toBe(0)
    expect(prismaMock.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: BigInt(2) },
      data: {
        publishedAt: null,
        retryCount: 1,
        lastError: "NACK ou erro de envio",
      },
    })
  })

  it("re-executa o ciclo caso um trigger ocorra durante um processamento em andamento", async () => {
    const mockChannel = {
      publish: vi.fn(
        (
          _exchange: string,
          _routingKey: string,
          _content: Buffer,
          _options: unknown,
          cb: (err?: Error | null) => void,
        ) => {
          cb(null)
          return true
        },
      ),
    }
    // biome-ignore lint/suspicious/noExplicitAny: mock de propriedade privada para teste
    ;(service as any).channel = mockChannel

    let calls = 0
    prismaMock.outboxEvent.findMany.mockImplementation(async () => {
      calls++
      if (calls === 1) {
        // Dispara trigger durante o 1º ciclo
        service.trigger()
        return [
          {
            id: BigInt(10),
            routingKey: "e1",
            payload: {},
            headers: null,
            createdAt: new Date(),
            publishedAt: null,
          },
        ]
      }
      if (calls === 2) {
        return [
          {
            id: BigInt(11),
            routingKey: "e2",
            payload: {},
            headers: null,
            createdAt: new Date(),
            publishedAt: null,
          },
        ]
      }
      return []
    })
    prismaMock.outboxEvent.update.mockResolvedValue({})

    const count = await service.publishPendingEvents()

    expect(count).toBe(2)
    expect(prismaMock.outboxEvent.findMany).toHaveBeenCalledTimes(3)
  })
})
