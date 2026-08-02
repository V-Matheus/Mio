import { Injectable, Logger, Optional } from "@nestjs/common"
import type { DomainEvent } from "./domain-event"
import { OutboxPublisherService } from "./outbox-publisher.service"

export interface OutboxClient {
  outboxEvent: {
    create(args: {
      data: {
        routingKey: string
        payload: unknown
        headers?: unknown
      }
    }): Promise<unknown>
  }
}

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name)

  constructor(
    @Optional() private readonly outboxPublisher?: OutboxPublisherService,
  ) {}

  async publish<T>(
    event: DomainEvent<T>,
    options: { client: OutboxClient },
  ): Promise<void> {
    const headers: Record<string, unknown> = {
      "x-event-version": event.version ?? 1,
      "content-type": "application/json",
    }
    if (event.correlationId) {
      headers["x-correlation-id"] = event.correlationId
    }

    try {
      await options.client.outboxEvent.create({
        data: {
          routingKey: event.routingKey,
          payload: event.payload,
          headers,
        },
      })

      // Dispara o acionamento reativo no próximo tick para dar tempo do commit da transação
      if (this.outboxPublisher) {
        setImmediate(() => {
          this.outboxPublisher?.trigger()
        })
      }
    } catch (error) {
      this.logger.error(
        `Falha ao salvar evento ${event.routingKey} na outbox: ${(error as Error).message}`,
      )
      throw error
    }
  }
}
