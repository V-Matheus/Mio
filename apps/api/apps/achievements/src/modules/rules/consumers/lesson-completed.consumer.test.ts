import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CoreClientService } from "../../core-client/core-client.service"
import type { RulesEngineService } from "../rules-engine.service"
import {
  LESSON_COMPLETED_DEAD_ROUTING_KEY,
  LESSON_COMPLETED_DLQ,
  LESSON_COMPLETED_DLX,
  LESSON_COMPLETED_QUEUE,
  LESSON_COMPLETED_ROUTING_KEY,
  LessonCompletedConsumer,
  type LessonCompletedMessagePayload,
} from "./lesson-completed.consumer"

describe("LessonCompletedConsumer", () => {
  let rulesMock: { evaluateLessonsCompleted: ReturnType<typeof vi.fn> }
  let coreClientMock: { getTotalCompletedLessons: ReturnType<typeof vi.fn> }
  let consumer: LessonCompletedConsumer

  beforeEach(() => {
    rulesMock = {
      evaluateLessonsCompleted: vi.fn().mockResolvedValue(undefined),
    }
    coreClientMock = {
      getTotalCompletedLessons: vi.fn().mockResolvedValue(10),
    }
    consumer = new LessonCompletedConsumer(
      rulesMock as unknown as RulesEngineService,
      coreClientMock as unknown as CoreClientService,
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

  it("busca o total real de lições concluídas no Core e delega para RulesEngineService.evaluateLessonsCompleted", async () => {
    coreClientMock.getTotalCompletedLessons.mockResolvedValue(7)
    const payload: LessonCompletedMessagePayload = {
      userCode: "usr123",
      lessonId: "42",
    }

    await consumer.handleMessage(payload)

    expect(coreClientMock.getTotalCompletedLessons).toHaveBeenCalledWith(
      "usr123",
    )
    expect(rulesMock.evaluateLessonsCompleted).toHaveBeenCalledWith("usr123", 7)
  })

  it("descarta payload sem userCode sem consultar o Core nem chamar o motor de regras", async () => {
    const payload = {
      userCode: "",
      lessonId: "42",
    } as LessonCompletedMessagePayload

    await consumer.handleMessage(payload)

    expect(coreClientMock.getTotalCompletedLessons).not.toHaveBeenCalled()
    expect(rulesMock.evaluateLessonsCompleted).not.toHaveBeenCalled()
  })
})
