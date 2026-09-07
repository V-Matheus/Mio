import {
  AchievementUnlockedEvent,
  EventPublisherService,
  type OutboxClient,
} from "@mio/events"
import { Injectable } from "@nestjs/common"

export type AchievementUnlockedPayload = {
  userCode: string
  achievementSlug: string
  title: string
  iconUrl: string
  unlockedAt: string
  xpReward: number
}

@Injectable()
export class AchievementEventsPublisher {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async achievementUnlocked(
    payload: AchievementUnlockedPayload,
    options: { client: OutboxClient },
  ): Promise<void> {
    await this.eventPublisher.publish(
      new AchievementUnlockedEvent(payload),
      options,
    )
  }
}
