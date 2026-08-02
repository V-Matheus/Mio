import {
  EventPublisherService,
  LessonCompletedEvent,
  type OutboxClient,
} from "@mio/events"
import { Injectable } from "@nestjs/common"
import type { LessonCompletedEventPayload } from "./progress-events.types"

@Injectable()
export class ProgressEventsPublisher {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async lessonCompleted(
    payload: LessonCompletedEventPayload,
    options: { client: OutboxClient },
  ): Promise<void> {
    await this.eventPublisher.publish(
      new LessonCompletedEvent(payload),
      options,
    )
  }
}
