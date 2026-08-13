import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { XpService } from "../xp.service"

export const LESSON_COMPLETED_QUEUE = "gamification.lesson.completed"
export const LESSON_COMPLETED_ROUTING_KEY = "lesson.completed"
export const LESSON_COMPLETED_DLX = "mio.events.dlx"
export const LESSON_COMPLETED_DLQ = "gamification.lesson.completed.dlq"
export const LESSON_COMPLETED_DEAD_ROUTING_KEY =
  "gamification.lesson.completed.dead"

export interface LessonCompletedMessagePayload {
  userCode: string
  trackSlug?: string
  lessonSlug?: string
  lessonId: string | number
  trackId?: string | number
  completedAt?: string
}

@Injectable()
export class LessonCompletedConsumer extends AmqpConsumerService<LessonCompletedMessagePayload> {
  constructor(private readonly xpService: XpService) {
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
    if (!payload?.userCode || !payload?.lessonId) {
      this.logger.warn(
        `Mensagem descartada por payload inválido: campos obrigatórios ausentes (queue: ${this.options.queue}, routingKey: ${this.options.routingKey}, hasUserCode: ${Boolean(payload?.userCode)}, hasLessonId: ${Boolean(payload?.lessonId)})`,
      )
      return
    }

    await this.xpService.rewardLessonCompleted(
      payload.userCode,
      payload.lessonId,
    )
  }
}
