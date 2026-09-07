import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { RulesEngineService } from "../rules-engine.service"

export const XP_REWARDED_QUEUE = "achievements.xp.rewarded"
export const XP_REWARDED_ROUTING_KEY = "xp.rewarded"
export const XP_REWARDED_DLX = "mio.events.dlx"
export const XP_REWARDED_DLQ = "achievements.xp.rewarded.dlq"
export const XP_REWARDED_DEAD_ROUTING_KEY = "achievements.xp.rewarded.dead"

export interface XpRewardedMessagePayload {
  userCode: string
  totalAfter: number
  streakCurrent?: number
}

@Injectable()
export class XpRewardedConsumer extends AmqpConsumerService<XpRewardedMessagePayload> {
  constructor(private readonly rules: RulesEngineService) {
    super({
      queue: XP_REWARDED_QUEUE,
      routingKey: XP_REWARDED_ROUTING_KEY,
      deadLetterExchange: XP_REWARDED_DLX,
      deadLetterQueue: XP_REWARDED_DLQ,
      deadLetterRoutingKey: XP_REWARDED_DEAD_ROUTING_KEY,
      maxRetries: 3,
    })
  }

  async handleMessage(payload: XpRewardedMessagePayload): Promise<void> {
    if (!payload?.userCode || typeof payload.totalAfter !== "number") {
      this.logger.warn(
        `Mensagem descartada por payload inválido: campos obrigatórios ausentes (queue: ${this.options.queue}, routingKey: ${this.options.routingKey})`,
      )
      return
    }

    await this.rules.evaluateTotalXp(payload.userCode, payload.totalAfter)

    if (typeof payload.streakCurrent === "number") {
      await this.rules.evaluateStreakDays(
        payload.userCode,
        payload.streakCurrent,
      )
    }
  }
}
