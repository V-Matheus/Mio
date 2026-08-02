import {
  EventPublisherService,
  UserPasswordResetRequestedEvent,
  UserRegisteredEvent,
} from "@mio/events"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import type {
  UserPasswordResetRequestedPayload,
  UserRegisteredPayload,
} from "./user-events.types"

/**
 * Publisher de eventos do módulo users. Delegado no `EventPublisherService`
 * para salvar eventos de domínio na outbox com tipagem forte e garantias transacionais.
 */
@Injectable()
export class UserEventsPublisher {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly prisma: PrismaService,
  ) {}

  async userRegistered(payload: UserRegisteredPayload): Promise<void> {
    await this.eventPublisher.publish(new UserRegisteredEvent(payload), {
      client: this.prisma,
    })
  }

  async userPasswordResetRequested(
    payload: UserPasswordResetRequestedPayload,
  ): Promise<void> {
    await this.eventPublisher.publish(
      new UserPasswordResetRequestedEvent(payload),
      {
        client: this.prisma,
      },
    )
  }
}
