import type { ConsumeMessage } from "amqplib"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AmqpConsumerService } from "./amqp-consumer.service"

const mockChannel = {
  assertExchange: vi.fn().mockResolvedValue({}),
  assertQueue: vi.fn().mockResolvedValue({ queue: "test.queue" }),
  bindQueue: vi.fn().mockResolvedValue({}),
  consume: vi.fn(),
  ack: vi.fn(),
  nack: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
}

const mockConnection = {
  createChannel: vi.fn().mockResolvedValue(mockChannel),
  on: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
}

vi.mock("amqplib", () => ({
  connect: vi.fn().mockImplementation(() => Promise.resolve(mockConnection)),
}))

type TestPayload = { count: number }

class TestConsumer extends AmqpConsumerService<TestPayload> {
  public handledPayloads: TestPayload[] = []
  public shouldFail = false

  constructor() {
    super({
      queue: "test.queue",
      routingKey: "test.event",
    })
  }

  async handleMessage(payload: TestPayload): Promise<void> {
    if (this.shouldFail) {
      throw new Error("handler error")
    }
    this.handledPayloads.push(payload)
  }
}

describe("AmqpConsumerService", () => {
  let consumer: TestConsumer

  beforeEach(() => {
    vi.clearAllMocks()
    consumer = new TestConsumer()
  })

  it("configura exchange, queue e binding ao iniciar", async () => {
    await consumer.startConsumer()

    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "mio.events",
      "topic",
      {
        durable: true,
      },
    )
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test.queue", {
      durable: true,
    })
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "test.queue",
      "mio.events",
      "test.event",
    )
    expect(mockChannel.consume).toHaveBeenCalledWith(
      "test.queue",
      expect.any(Function),
      { noAck: false },
    )
  })

  it("processa mensagem com sucesso e executa ack", async () => {
    await consumer.startConsumer()

    const consumeCallback = mockChannel.consume.mock.calls[0]?.[1]
    expect(consumeCallback).toBeDefined()
    const fakeMsg: ConsumeMessage = {
      content: Buffer.from(JSON.stringify({ count: 42 })),
    } as ConsumeMessage

    await consumeCallback?.(fakeMsg)

    expect(consumer.handledPayloads).toEqual([{ count: 42 }])
    expect(mockChannel.ack).toHaveBeenCalledWith(fakeMsg)
  })

  it("faz nack se o payload for JSON invalido", async () => {
    await consumer.startConsumer()

    const consumeCallback = mockChannel.consume.mock.calls[0]?.[1]
    expect(consumeCallback).toBeDefined()
    const fakeMsg: ConsumeMessage = {
      content: Buffer.from("invalid-json"),
    } as ConsumeMessage

    await consumeCallback?.(fakeMsg)

    expect(mockChannel.nack).toHaveBeenCalledWith(fakeMsg, false, false)
    expect(mockChannel.ack).not.toHaveBeenCalled()
  })

  it("faz nack se o handleMessage lançar erro", async () => {
    consumer.shouldFail = true
    await consumer.startConsumer()

    const consumeCallback = mockChannel.consume.mock.calls[0]?.[1]
    expect(consumeCallback).toBeDefined()
    const fakeMsg: ConsumeMessage = {
      content: Buffer.from(JSON.stringify({ count: 1 })),
    } as ConsumeMessage

    await consumeCallback?.(fakeMsg)

    expect(mockChannel.nack).toHaveBeenCalledWith(fakeMsg, false, false)
  })
})
