import { Injectable, Logger, type OnModuleDestroy } from "@nestjs/common"
import * as amqp from "amqplib"
import {
  EVENT_VERSION,
  EVENTS_EXCHANGE,
  UserEventRoutingKey,
  type UserPasswordResetRequestedPayload,
  type UserRegisteredPayload,
} from "./user-events.types"

/**
 * Publisher AMQP self-contained do módulo users. Publica os eventos `user.*` no
 * topic exchange `mio.events`. Conexão lazy; falha de broker é logada sem
 * derrubar o request que disparou o evento.
 *
 * Quando a spec 00 introduzir o `EventBusModule` compartilhado, este publisher
 * passa a delegar nele em vez de gerenciar a conexão diretamente.
 */
@Injectable()
export class UserEventsPublisher implements OnModuleDestroy {
  private readonly logger = new Logger(UserEventsPublisher.name)
  private connection?: amqp.ChannelModel
  private channel?: amqp.Channel
  private connecting?: Promise<amqp.Channel | undefined>

  async userRegistered(payload: UserRegisteredPayload): Promise<void> {
    await this.publish(UserEventRoutingKey.Registered, payload)
  }

  async userPasswordResetRequested(
    payload: UserPasswordResetRequestedPayload,
  ): Promise<void> {
    await this.publish(UserEventRoutingKey.PasswordResetRequested, payload)
  }

  private async publish(routingKey: string, payload: unknown): Promise<void> {
    try {
      const channel = await this.getChannel()
      if (!channel) {
        return
      }
      channel.publish(
        EVENTS_EXCHANGE,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        {
          contentType: "application/json",
          persistent: true,
          headers: { "x-event-version": EVENT_VERSION },
        },
      )
    } catch (error) {
      this.logger.error(
        `Falha ao publicar evento ${routingKey}: ${(error as Error).message}`,
      )
    }
  }

  private async getChannel(): Promise<amqp.Channel | undefined> {
    if (this.channel) {
      return this.channel
    }
    if (!this.connecting) {
      this.connecting = this.connect()
    }
    return this.connecting
  }

  private async connect(): Promise<amqp.Channel | undefined> {
    const url = process.env.RABBITMQ_URL
    if (!url) {
      this.logger.warn("RABBITMQ_URL ausente; eventos não serão publicados")
      this.connecting = undefined
      return undefined
    }
    try {
      this.connection = await amqp.connect(url)
      this.connection.on("error", (error) => this.reset(error))
      this.connection.on("close", () => this.reset())

      const channel = await this.connection.createChannel()
      await channel.assertExchange(EVENTS_EXCHANGE, "topic", { durable: true })
      this.channel = channel
      return channel
    } catch (error) {
      this.logger.error(
        `Falha ao conectar no RabbitMQ: ${(error as Error).message}`,
      )
      this.reset()
      return undefined
    }
  }

  private reset(error?: Error): void {
    if (error) {
      this.logger.error(`Conexão AMQP perdida: ${error.message}`)
    }
    this.channel = undefined
    this.connection = undefined
    this.connecting = undefined
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close()
      await this.connection?.close()
    } catch {
      // ignora erros de fechamento
    }
  }
}
