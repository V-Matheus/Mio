import { AmqpConsumerService } from "@mio/events"
import { Injectable } from "@nestjs/common"
import { XpService } from "../xp.service"

export const ACHIEVEMENT_UNLOCKED_QUEUE = "gamification.achievement.unlocked"
export const ACHIEVEMENT_UNLOCKED_ROUTING_KEY = "achievement.unlocked"
export const ACHIEVEMENT_UNLOCKED_DLX = "mio.events.dlx"
export const ACHIEVEMENT_UNLOCKED_DLQ = "gamification.achievement.unlocked.dlq"
export const ACHIEVEMENT_UNLOCKED_DEAD_ROUTING_KEY =
  "gamification.achievement.unlocked.dead"

export interface AchievementUnlockedMessagePayload {
  userCode: string
  achievementSlug: string
  title?: string
  iconUrl?: string
  unlockedAt?: string
  xpReward?: number
}

/**
 * Credita o XP bônus de conquistas desbloqueadas pelo serviço Achievements.
 * Achievements nunca publica `xp.rewarded` diretamente — apenas a conquista
 * (`achievement.unlocked`); quem credita XP é a Gamification (decisão B do
 * spec 05), mantendo a separação de responsabilidades entre os domínios.
 */
@Injectable()
export class AchievementUnlockedConsumer extends AmqpConsumerService<AchievementUnlockedMessagePayload> {
  constructor(private readonly xpService: XpService) {
    super({
      queue: ACHIEVEMENT_UNLOCKED_QUEUE,
      routingKey: ACHIEVEMENT_UNLOCKED_ROUTING_KEY,
      deadLetterExchange: ACHIEVEMENT_UNLOCKED_DLX,
      deadLetterQueue: ACHIEVEMENT_UNLOCKED_DLQ,
      deadLetterRoutingKey: ACHIEVEMENT_UNLOCKED_DEAD_ROUTING_KEY,
      maxRetries: 3,
    })
  }

  async handleMessage(
    payload: AchievementUnlockedMessagePayload,
  ): Promise<void> {
    if (!payload?.userCode || !payload?.achievementSlug) {
      this.logger.warn(
        `Mensagem descartada por payload inválido: campos obrigatórios ausentes (queue: ${this.options.queue}, routingKey: ${this.options.routingKey})`,
      )
      return
    }

    const amount = payload.xpReward ?? 0
    if (amount <= 0) {
      return
    }

    await this.xpService.rewardAchievementUnlocked(
      payload.userCode,
      payload.achievementSlug,
      amount,
    )
  }
}
