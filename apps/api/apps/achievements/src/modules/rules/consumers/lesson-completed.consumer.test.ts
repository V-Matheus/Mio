import { beforeEach, describe, expect, it, vi } from "vitest"
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
  let consumer: LessonCompletedConsumer

  beforeEach(() => {
    rulesMock = {
      evaluateLessonsCompleted: vi.fn().mockResolvedValue(undefined),
    }
    consumer = new LessonCompletedConsumer(
      rulesMock as unknown as RulesEngineService,
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

  it("processa mensagem válida delegando para RulesEngineService.evaluateLessonsCompleted", async () => {
    const payload: LessonCompletedMessagePayload = {
      userCode: "usr123",
      lessonId: "42",
    }

    await consumer.handleMessage(payload)

    expect(rulesMock.evaluateLessonsCompleted).toHaveBeenCalledWith("usr123")
  })

  it("descarta payload sem userCode sem chamar o motor de regras", async () => {
    const payload = {
      userCode: "",
      lessonId: "42",
    } as LessonCompletedMessagePayload

    await consumer.handleMessage(payload)

    expect(rulesMock.evaluateLessonsCompleted).not.toHaveBeenCalled()
  })
})
