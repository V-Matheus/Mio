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
    service = new OutboxPublisherService()
    service.setClient(prismaMock as never)
  })

  it("retorna 0 e NÃO altera o banco se o RabbitMQ não estiver conectado/configurado", async () => {
    delete process.env.RABBITMQ_URL

    const count = await service.publishPendingEvents()

    expect(count).toBe(0)
    expect(prismaMock.outboxEvent.findMany).not.toHaveBeenCalled()
    expect(prismaMock.outboxEvent.update).not.toHaveBeenCalled()
  })

  it("publica no RabbitMQ via ConfirmChannel e marca no banco após confirmação", async () => {
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
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "mio.events",
      "lesson.completed",
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "application/json",
        persistent: true,
      }),
      expect.any(Function),
    )
    expect(prismaMock.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: BigInt(1) },
      data: { publishedAt: expect.any(Date) },
    })
  })

  it("NÃO marca o evento como publicado se a confirmação do RabbitMQ falhar", async () => {
    const event = {
      id: BigInt(2),
      routingKey: "lesson.completed",
      payload: { userCode: "xyz" },
      headers: null,
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
    expect(prismaMock.outboxEvent.update).not.toHaveBeenCalled()
  })

  it("ignora chamada concorrente se já houver processamento em andamento", async () => {
    const mockChannel = {
      publish: vi.fn(),
    }
    // biome-ignore lint/suspicious/noExplicitAny: mock de propriedade privada para teste
    ;(service as any).channel = mockChannel

    let resolveFindMany: (value: unknown[]) => void = () => {}
    prismaMock.outboxEvent.findMany.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFindMany = resolve
        }),
    )

    const p1 = service.publishPendingEvents()
    const p2 = service.publishPendingEvents()

    const count2 = await p2
    expect(count2).toBe(0)

    resolveFindMany([])
    const count1 = await p1
    expect(count1).toBe(0)

    expect(prismaMock.outboxEvent.findMany).toHaveBeenCalledTimes(1)
  })
})
