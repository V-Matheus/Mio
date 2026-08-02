import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common"
import * as amqp from "amqplib"

export const EVENTS_EXCHANGE = "mio.events"

export interface OutboxPollerClient {
  outboxEvent: {
    findMany(args: {
      where: { publishedAt: null }
      orderBy: { createdAt: "asc" }
      take: number
    }): Promise<
      Array<{
        id: bigint | number
        routingKey: string
        payload: unknown
        headers?: unknown
        createdAt: Date
        publishedAt: Date | null
      }>
    >
    update(args: {
      where: { id: bigint | number }
      data: { publishedAt: Date }
    }): Promise<unknown>
  }
}

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name)
  private connection?: amqp.ChannelModel
  private channel?: amqp.ConfirmChannel
  private connecting?: Promise<amqp.ConfirmChannel | undefined>
  private timer?: NodeJS.Timeout
  private isProcessing = false
  private client?: OutboxPollerClient

  setClient(client: OutboxPollerClient): void {
    this.client = client
  }

  /**
   * Acorda o worker reativamente em memória logo após um novo evento ser gravado.
   */
  trigger(): void {
    if (this.isProcessing) return
    this.publishPendingEvents().catch((err) => {
      this.logger.error(
        `Erro ao publicar eventos da outbox (trigger): ${(err as Error).message}`,
      )
    })
  }

  onModuleInit(): void {
    // Intervalo de fallback longo (30 segundos). A publicação principal ocorre reativamente via trigger().
    const intervalMs = Number.parseInt(
      process.env.OUTBOX_POLL_INTERVAL_MS || "30000",
      10,
    )
    this.timer = setInterval(() => {
      this.publishPendingEvents().catch((err) => {
        this.logger.error(
          `Erro ao publicar eventos da outbox (fallback): ${(err as Error).message}`,
        )
      })
    }, intervalMs)
  }

  async publishPendingEvents(
    overrideClient?: OutboxPollerClient,
  ): Promise<number> {
    const db = overrideClient ?? this.client
    if (!db) {
      return 0
    }

    if (this.isProcessing) {
      this.logger.debug(
        "Publicação da outbox já em andamento, ignorando ciclo concorrente",
      )
      return 0
    }
    this.isProcessing = true

    try {
      const channel = await this.getChannel()
      if (!channel) {
        return 0
      }

      const pendingEvents = await db.outboxEvent.findMany({
        where: { publishedAt: null },
        orderBy: { createdAt: "asc" },
        take: 50,
      })

      if (pendingEvents.length === 0) {
        return 0
      }

      let publishedCount = 0

      for (const event of pendingEvents) {
        try {
          const headers =
            typeof event.headers === "object" && event.headers !== null
              ? (event.headers as Record<string, unknown>)
              : { "x-event-version": 1 }

          await new Promise<void>((resolve, reject) => {
            channel.publish(
              EVENTS_EXCHANGE,
              event.routingKey,
              Buffer.from(JSON.stringify(event.payload)),
              {
                contentType: "application/json",
                persistent: true,
                headers,
              },
              (err) => {
                if (err) return reject(err)
                resolve()
              },
            )
          })

          await db.outboxEvent.update({
            where: { id: event.id },
            data: { publishedAt: new Date() },
          })

          publishedCount++
        } catch (error) {
          this.logger.error(
            `Falha ao processar outbox event #${event.id} (${event.routingKey}): ${(error as Error).message}`,
          )
          break
        }
      }

      return publishedCount
    } finally {
      this.isProcessing = false
    }
  }

  private async getChannel(): Promise<amqp.ConfirmChannel | undefined> {
    if (this.channel) {
      return this.channel
    }
    if (!this.connecting) {
      this.connecting = this.connect()
    }
    return this.connecting
  }

  private async connect(): Promise<amqp.ConfirmChannel | undefined> {
    const url = process.env.RABBITMQ_URL
    if (!url) {
      this.logger.warn(
        "RABBITMQ_URL ausente; outbox aguardará conexão com o RabbitMQ",
      )
      this.connecting = undefined
      return undefined
    }
    try {
      this.connection = await amqp.connect(url)
      this.connection.on("error", (error) => this.reset(error))
      this.connection.on("close", () => this.reset())

      const channel = await this.connection.createConfirmChannel()
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
