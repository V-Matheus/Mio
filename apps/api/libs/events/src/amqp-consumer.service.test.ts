import type { ConsumeMessage } from "amqplib"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  type AmqpConsumerOptions,
  AmqpConsumerService,
} from "./amqp-consumer.service"

const createMockChannel = () => ({
  assertExchange: vi.fn().mockResolvedValue({}),
  assertQueue: vi.fn().mockResolvedValue({ queue: "test.queue" }),
  bindQueue: vi.fn().mockResolvedValue({}),
  consume: vi.fn(),
  ack: vi.fn(),
  nack: vi.fn(),
  publish: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
})

let mockChannel = createMockChannel()

const mockConnection = {
  createChannel: vi.fn().mockImplementation(() => Promise.resolve(mockChannel)),
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

  constructor(customOptions?: Partial<AmqpConsumerOptions>) {
    super({
      queue: "test.queue",
      routingKey: "test.event",
      ...customOptions,
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
    mockChannel = createMockChannel()
    mockConnection.createChannel.mockImplementation(() =>
      Promise.resolve(mockChannel),
    )
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

  it("configura deadLetterExchange e deadLetterQueue se fornecidos nas opções", async () => {
    const dlxConsumer = new TestConsumer({
      deadLetterExchange: "mio.events.dlx",
      deadLetterQueue: "test.queue.dlq",
      deadLetterRoutingKey: "test.event.dead",
    })

    await dlxConsumer.startConsumer()

    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      "mio.events.dlx",
      "topic",
      { durable: true },
    )
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test.queue.dlq", {
      durable: true,
    })
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      "test.queue.dlq",
      "mio.events.dlx",
      "test.event.dead",
    )
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test.queue", {
      durable: true,
      deadLetterExchange: "mio.events.dlx",
      deadLetterRoutingKey: "test.event.dead",
    })
  })

  it("processa mensagem com sucesso e executa ack no canal de consumo", async () => {
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

  it("faz nack sem requeue se o payload for JSON inválido / malformado", async () => {
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

  it("republica com cabeçalho de retry incrementado mesmo sem DLX configurada", async () => {
    const noDlxConsumer = new TestConsumer({ maxRetries: 3 })
    noDlxConsumer.shouldFail = true
    await noDlxConsumer.startConsumer()

    const consumeCallback = mockChannel.consume.mock.calls[0]?.[1]
    expect(consumeCallback).toBeDefined()
    const fakeMsg = {
      content: Buffer.from(JSON.stringify({ count: 1 })),
      fields: { routingKey: "test.event" },
      properties: { headers: {} },
    } as unknown as ConsumeMessage

    await consumeCallback?.(fakeMsg)

    // Tentativa 1 de 3 falhou: deve republicar com x-retry-count: 1 e dar ack na mensagem original
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "mio.events",
      "test.event",
      fakeMsg.content,
      expect.objectContaining({
        headers: { "x-retry-count": 1 },
      }),
    )
    expect(mockChannel.ack).toHaveBeenCalledWith(fakeMsg)
    expect(mockChannel.nack).not.toHaveBeenCalled()
  })

  it("interrompe reenfileiramento (nack false, false) quando maxRetries for atingido sem DLX configurada", async () => {
    const noDlxConsumer = new TestConsumer({ maxRetries: 3 })
    noDlxConsumer.shouldFail = true
    await noDlxConsumer.startConsumer()

    const consumeCallback = mockChannel.consume.mock.calls[0]?.[1]
    expect(consumeCallback).toBeDefined()
    const fakeMsg = {
      content: Buffer.from(JSON.stringify({ count: 1 })),
      fields: { routingKey: "test.event" },
      properties: { headers: { "x-retry-count": 2 } },
    } as unknown as ConsumeMessage

    await consumeCallback?.(fakeMsg)

    // Tentativa 3 de 3 falhou: deve interromper reenfileiramento descartando mensagem com nack(..., false, false)
    expect(mockChannel.nack).toHaveBeenCalledWith(fakeMsg, false, false)
    expect(mockChannel.publish).not.toHaveBeenCalled()
  })

  it("republica com cabeçalho de retry incrementado em caso de falha recuperável com DLX configurada", async () => {
    const dlxConsumer = new TestConsumer({
      deadLetterExchange: "mio.events.dlx",
      maxRetries: 3,
    })
    dlxConsumer.shouldFail = true
    await dlxConsumer.startConsumer()

    const consumeCallback = mockChannel.consume.mock.calls[0]?.[1]
    expect(consumeCallback).toBeDefined()
    const fakeMsg = {
      content: Buffer.from(JSON.stringify({ count: 1 })),
      fields: { routingKey: "test.event" },
      properties: { headers: { "x-retry-count": 1 } },
    } as unknown as ConsumeMessage

    await consumeCallback?.(fakeMsg)

    // Tentativa 2 de 3: deve republicar com x-retry-count = 2 e dar ack na mensagem anterior
    expect(mockChannel.publish).toHaveBeenCalledWith(
      "mio.events",
      "test.event",
      fakeMsg.content,
      expect.objectContaining({
        headers: { "x-retry-count": 2 },
      }),
    )
    expect(mockChannel.ack).toHaveBeenCalledWith(fakeMsg)
    expect(mockChannel.nack).not.toHaveBeenCalled()
  })

  it("faz nack sem requeue encaminhando para DLQ quando o limite maxRetries for atingido", async () => {
    const dlxConsumer = new TestConsumer({
      deadLetterExchange: "mio.events.dlx",
      maxRetries: 3,
    })
    dlxConsumer.shouldFail = true
    await dlxConsumer.startConsumer()

    const consumeCallback = mockChannel.consume.mock.calls[0]?.[1]
    expect(consumeCallback).toBeDefined()
    const fakeMsg = {
      content: Buffer.from(JSON.stringify({ count: 1 })),
      fields: { routingKey: "test.event" },
      properties: { headers: { "x-retry-count": 2 } },
    } as unknown as ConsumeMessage

    await consumeCallback?.(fakeMsg)

    // Tentativa 3 >= maxRetries (3): encaminha para DLQ com nack(..., false, false)
    expect(mockChannel.nack).toHaveBeenCalledWith(fakeMsg, false, false)
    expect(mockChannel.publish).not.toHaveBeenCalled()
  })

  it("vincula a confirmação (ack) ao canal de consumo capturado mesmo se this.channel for substituído por reconexão", async () => {
    const initialChannel = mockChannel
    await consumer.startConsumer()

    const initialCallback = initialChannel.consume.mock.calls[0]?.[1]
    expect(initialCallback).toBeDefined()

    // Simula reconexão que cria e substitui por um novo canal
    const newMockChannel = createMockChannel()
    mockChannel = newMockChannel
    await consumer.startConsumer()

    // Processa mensagem que chegou no primeiro canal
    const fakeMsg: ConsumeMessage = {
      content: Buffer.from(JSON.stringify({ count: 99 })),
    } as ConsumeMessage

    await initialCallback?.(fakeMsg)

    // O ack deve ter sido disparado no canal inicial (de onde veio a mensagem), NÃO no novo canal
    expect(initialChannel.ack).toHaveBeenCalledWith(fakeMsg)
    expect(newMockChannel.ack).not.toHaveBeenCalled()
  })
})
