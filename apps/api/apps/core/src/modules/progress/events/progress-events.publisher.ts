import { EventPublisherService, LessonCompletedEvent } from "@mio/events"
import { Injectable } from "@nestjs/common"
import type { LessonCompletedEventPayload } from "./progress-events.types"

@Injectable()
export class ProgressEventsPublisher {
  constructor(private readonly eventPublisher: EventPublisherService) {}

  async lessonCompleted(
    payload: LessonCompletedEventPayload,
    options?: {
      client: { outboxEvent: { create(args: unknown): Promise<unknown> } }
    },
  ): Promise<void> {
    await this.eventPublisher.publish(new LessonCompletedEvent(payload), {
      client: options?.client as never,
    })
  }
}
