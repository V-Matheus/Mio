import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common"
import * as amqp from "amqplib"
import { PrismaService } from "../prisma/prisma.service"

export const EVENTS_EXCHANGE = "mio.events"

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name)
  private connection?: amqp.ChannelModel
  private channel?: amqp.Channel
  private connecting?: Promise<amqp.Channel | undefined>
  private timer?: NodeJS.Timeout

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    // Roda a publicação a cada 2000ms
    const intervalMs = Number.parseInt(
      process.env.OUTBOX_POLL_INTERVAL_MS || "2000",
      10,
    )
    this.timer = setInterval(() => {
      this.publishPendingEvents().catch((err) => {
        this.logger.error(
          `Erro ao publicar eventos da outbox: ${(err as Error).message}`,
        )
      })
    }, intervalMs)
  }

  async publishPendingEvents(): Promise<number> {
    const pendingEvents = await this.prisma.outboxEvent.findMany({
      where: { publishedAt: null },
      orderBy: { createdAt: "asc" },
      take: 50,
    })

    if (pendingEvents.length === 0) {
      return 0
    }

    const channel = await this.getChannel()
    let publishedCount = 0

    for (const event of pendingEvents) {
      try {
        if (channel) {
          const headers =
            typeof event.headers === "object" && event.headers !== null
              ? (event.headers as Record<string, unknown>)
              : { "x-event-version": 1 }

          channel.publish(
            EVENTS_EXCHANGE,
            event.routingKey,
            Buffer.from(JSON.stringify(event.payload)),
            {
              contentType: "application/json",
              persistent: true,
              headers,
            },
          )
        }

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { publishedAt: new Date() },
        })

        publishedCount++
      } catch (error) {
        this.logger.error(
          `Falha ao processar outbox event #${event.id} (${event.routingKey}): ${(error as Error).message}`,
        )
        break // Interrompe para evitar loop infinito em caso de desconexão
      }
    }

    return publishedCount
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
      this.logger.warn(
        "RABBITMQ_URL ausente; outbox não enviará para o RabbitMQ",
      )
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
        `Falha ao conectar no RabbitMQ para Outbox: ${(error as Error).message}`,
      )
      this.reset()
      return undefined
    }
  }

  private reset(error?: Error): void {
    if (error) {
      this.logger.error(`Conexão AMQP da Outbox perdida: ${error.message}`)
    }
    this.channel = undefined
    this.connection = undefined
    this.connecting = undefined
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
    }
    try {
      await this.channel?.close()
      await this.connection?.close()
    } catch {
      // ignora erros de fechamento
    }
  }
}
