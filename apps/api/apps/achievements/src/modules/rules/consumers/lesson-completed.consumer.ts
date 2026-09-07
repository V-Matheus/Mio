import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { CoreClientService } from "../../core-client/core-client.service"
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

/**
 * Não mantém contador local: busca o total de lições concluídas direto no
 * Core (fonte da verdade) a cada evento. Reentrega do broker é inofensiva
 * por construção — reprocessar só refaz a mesma pergunta e recebe a mesma
 * resposta, sem risco de contagem duplicada.
 */
@Injectable()
export class LessonCompletedConsumer extends AmqpConsumerService<LessonCompletedMessagePayload> {
  constructor(
    private readonly rules: RulesEngineService,
    private readonly coreClient: CoreClientService,
  ) {
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

    const totalCompletedLessons =
      await this.coreClient.getTotalCompletedLessons(payload.userCode)
    await this.rules.evaluateLessonsCompleted(
      payload.userCode,
      totalCompletedLessons,
    )
  }
}
