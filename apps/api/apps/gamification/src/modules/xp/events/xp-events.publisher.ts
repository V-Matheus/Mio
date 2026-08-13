import {
  EventPublisherService,
  type OutboxClient,
  XpRewardedEvent,
} from "@mio/events"
import { Injectable } from "@nestjs/common"

export type XpRewardedPayload = {
  userCode: string
  amount: number
  reason: string
  sourceId?: string
  totalAfter: number
  level: string
  awardedAt: string
}

@Injectable()
export class XpEventsPublisher {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async xpRewarded(
    payload: XpRewardedPayload,
    options: { client: OutboxClient },
  ): Promise<void> {
    await this.eventPublisher.publish(new XpRewardedEvent(payload), options)
  }
}
