import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { RulesEngineService } from "../rules-engine.service"

export const LESSON_COMPLETED_QUEUE = "achievements.lesson.completed"
export const LESSON_COMPLETED_ROUTING_KEY = "lesson.completed"
export const LESSON_COMPLETED_DLX = "mio.events.dlx"
export const LESSON_COMPLETED_DLQ = "achievements.lesson.completed.dlq"
export const LESSON_COMPLETED_DEAD_ROUTING_KEY =
  "achievements.lesson.completed.dead"

export interface LessonCompletedMessagePayload {
  userCode: string
  lessonId: string | number
}

@Injectable()
export class LessonCompletedConsumer extends AmqpConsumerService<LessonCompletedMessagePayload> {
  constructor(private readonly rules: RulesEngineService) {
    super({
      queue: LESSON_COMPLETED_QUEUE,
      routingKey: LESSON_COMPLETED_ROUTING_KEY,
      deadLetterExchange: LESSON_COMPLETED_DLX,
      deadLetterQueue: LESSON_COMPLETED_DLQ,
      deadLetterRoutingKey: LESSON_COMPLETED_DEAD_ROUTING_KEY,
      maxRetries: 3,
    })
  }

  async handleMessage(payload: LessonCompletedMessagePayload): Promise<void> {
    if (!payload?.userCode) {
      this.logger.warn(
        `Mensagem descartada por payload inválido: userCode ausente (queue: ${this.options.queue}, routingKey: ${this.options.routingKey})`,
      )
      return
    }

    await this.rules.evaluateLessonsCompleted(payload.userCode)
  }
}
