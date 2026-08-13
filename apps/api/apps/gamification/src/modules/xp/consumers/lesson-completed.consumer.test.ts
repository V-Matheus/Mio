import type { ConsumeMessage } from "amqplib"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { XpService } from "../xp.service"
import {
  LESSON_COMPLETED_DEAD_ROUTING_KEY,
  LESSON_COMPLETED_DLQ,
  LESSON_COMPLETED_DLX,
  LESSON_COMPLETED_QUEUE,
  LESSON_COMPLETED_ROUTING_KEY,
  LessonCompletedConsumer,
} from "./lesson-completed.consumer"

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

  it("possui configuração correta de fila, DLX, DLQ e maxRetries", () => {
    const options = (
      consumer as unknown as { options: Record<string, unknown> }
    ).options

    expect(options.queue).toBe(LESSON_COMPLETED_QUEUE)
    expect(options.routingKey).toBe(LESSON_COMPLETED_ROUTING_KEY)
    expect(options.deadLetterExchange).toBe(LESSON_COMPLETED_DLX)
    expect(options.deadLetterQueue).toBe(LESSON_COMPLETED_DLQ)
    expect(options.deadLetterRoutingKey).toBe(LESSON_COMPLETED_DEAD_ROUTING_KEY)
    expect(options.maxRetries).toBe(3)
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

  it("registra aviso de rejeição com motivo fixo e metadados sem vazar o payload bruto ou userCode", async () => {
    const warnSpy = vi
      .spyOn(
        (consumer as unknown as { logger: { warn: (msg: string) => void } })
          .logger,
        "warn",
      )
      .mockImplementation(() => {})
    const payload = {
      userCode: "secret-user-123",
      lessonId: "",
      unvalidatedSecretData: "confidential",
    } as unknown as { userCode: string; lessonId: string }

    await consumer.handleMessage(payload)

    expect(xpServiceMock.rewardLessonCompleted).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
    const logMessage = String(warnSpy.mock.calls[0]?.[0] ?? "")
    expect(logMessage).toContain("Mensagem descartada por payload inválido")
    expect(logMessage).toContain("hasUserCode: true")
    expect(logMessage).toContain("hasLessonId: false")
    expect(logMessage).not.toContain("secret-user-123")
    expect(logMessage).not.toContain("unvalidatedSecretData")
    expect(logMessage).not.toContain("confidential")
  })

  it("propaga falha recuperável de banco de dados ou regras no handleMessage", async () => {
    xpServiceMock.rewardLessonCompleted.mockRejectedValueOnce(
      new Error("Database connection lost"),
    )

    const payload = {
      userCode: "usr123",
      lessonId: "42",
    }

    await expect(consumer.handleMessage(payload)).rejects.toThrow(
      "Database connection lost",
    )
  })

  it("processMessage executa retry com incremento de tentativa para falhas recuperáveis", async () => {
    xpServiceMock.rewardLessonCompleted.mockRejectedValueOnce(
      new Error("Transient failure in DB / Redis"),
    )

    const mockChannel = {
      publish: vi.fn(),
      ack: vi.fn(),
      nack: vi.fn(),
    }

    const fakeMsg: ConsumeMessage = {
      content: Buffer.from(
        JSON.stringify({ userCode: "usr123", lessonId: "42" }),
      ),
      fields: { routingKey: LESSON_COMPLETED_ROUTING_KEY },
      properties: { headers: {} },
    } as unknown as ConsumeMessage

    await (
      consumer as unknown as {
        processMessage: (ch: unknown, msg: unknown) => Promise<void>
      }
    ).processMessage(mockChannel, fakeMsg)

    expect(mockChannel.publish).toHaveBeenCalledWith(
      "mio.events",
      LESSON_COMPLETED_ROUTING_KEY,
      fakeMsg.content,
      expect.objectContaining({
        headers: { "x-retry-count": 1 },
      }),
    )
    expect(mockChannel.ack).toHaveBeenCalledWith(fakeMsg)
    expect(mockChannel.nack).not.toHaveBeenCalled()
  })

  it("processMessage envia para DLQ (nack false, false) quando o limite de tentativas for atingido", async () => {
    xpServiceMock.rewardLessonCompleted.mockRejectedValueOnce(
      new Error("Permanent unrecovered failure"),
    )

    const mockChannel = {
      publish: vi.fn(),
      ack: vi.fn(),
      nack: vi.fn(),
    }

    const fakeMsg: ConsumeMessage = {
      content: Buffer.from(
        JSON.stringify({ userCode: "usr123", lessonId: "42" }),
      ),
      fields: { routingKey: LESSON_COMPLETED_ROUTING_KEY },
      properties: { headers: { "x-retry-count": 2 } },
    } as unknown as ConsumeMessage

    await (
      consumer as unknown as {
        processMessage: (ch: unknown, msg: unknown) => Promise<void>
      }
    ).processMessage(mockChannel, fakeMsg)

    // Tentativa 3 de 3 -> nack(..., false, false) enviando para a DLQ
    expect(mockChannel.nack).toHaveBeenCalledWith(fakeMsg, false, false)
    expect(mockChannel.publish).not.toHaveBeenCalled()
  })
})
