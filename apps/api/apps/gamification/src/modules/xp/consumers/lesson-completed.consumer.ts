import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { XpService } from "../xp.service"

export const LESSON_COMPLETED_QUEUE = "gamification.lesson.completed"
export const LESSON_COMPLETED_ROUTING_KEY = "lesson.completed"

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
    })
  }

  async handleMessage(payload: LessonCompletedMessagePayload): Promise<void> {
    if (!payload.userCode || !payload.lessonId) {
      this.logger.warn(
        `Mensagem descartada por payload inválido: ${JSON.stringify(payload)}`,
      )
      return
    }

    await this.xpService.rewardLessonCompleted(
      payload.userCode,
      payload.lessonId,
    )
  }
}
