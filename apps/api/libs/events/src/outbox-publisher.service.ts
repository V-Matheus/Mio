import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common"
import * as amqp from "amqplib"

export const EVENTS_EXCHANGE = "mio.events"
export const MAX_OUTBOX_RETRIES = 5

export interface OutboxPollerClient {
  outboxEvent: {
    findMany(args: {
      where: {
        publishedAt: null
        retryCount?: { lt: number }
      }
      orderBy: { createdAt: "asc" }
      take: number
    }): Promise<
      Array<{
        id: bigint | number
        routingKey: string
        payload: unknown
        headers?: unknown
        retryCount?: number
        lastError?: string | null
        createdAt: Date
        publishedAt: Date | null
      }>
    >
    updateMany(args: {
      where: {
        id: bigint | number
        publishedAt: null
      }
      data: { publishedAt: Date }
    }): Promise<{ count: number }>
    update(args: {
      where: { id: bigint | number }
      data: {
        publishedAt?: Date | null
        retryCount?: number
        lastError?: string | null
      }
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
  private hasPendingTrigger = false
  private client?: OutboxPollerClient

  setClient(client: OutboxPollerClient): void {
    this.client = client
  }

  /**
   * Acorda o worker reativamente em memória logo após um novo evento ser gravado.
   * Se um ciclo já estiver em execução, marca uma flag para re-executar imediatamente ao término.
   */
  trigger(): void {
    if (this.isProcessing) {
      this.hasPendingTrigger = true
      return
    }
    this.publishPendingEvents().catch((err) => {
      this.logger.error(
        `Erro ao publicar eventos da outbox (trigger): ${(err as Error).message}`,
      )
    })
  }

  onModuleInit(): void {
    const DEFAULT_INTERVAL_MS = 30000
    const MIN_INTERVAL_MS = 1000

    const rawInterval = Number.parseInt(
      process.env.OUTBOX_POLL_INTERVAL_MS || "",
      10,
    )

    const intervalMs =
      Number.isNaN(rawInterval) || rawInterval < MIN_INTERVAL_MS
        ? DEFAULT_INTERVAL_MS
        : rawInterval

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
      this.hasPendingTrigger = true
      this.logger.debug(
        "Publicação da outbox já em andamento, reagendando próximo ciclo",
      )
      return 0
    }
    this.isProcessing = true

    let totalPublished = 0

    try {
      const channel = await this.getChannel()
      if (!channel) {
        return 0
      }

      do {
        this.hasPendingTrigger = false

        // Ignora eventos que já excederam o limite máximo de tentativas (Dead-Letter)
        const pendingEvents = await db.outboxEvent.findMany({
          where: {
            publishedAt: null,
            retryCount: { lt: MAX_OUTBOX_RETRIES },
          },
          orderBy: { createdAt: "asc" },
          take: 50,
        })

        if (pendingEvents.length === 0) {
          break
        }

        let batchCount = 0

        for (const event of pendingEvents) {
          try {
            // Reivindicação atômica condicional para evitar concorrência entre réplicas
            const claim = await db.outboxEvent.updateMany({
              where: {
                id: event.id,
                publishedAt: null,
              },
              data: {
                publishedAt: new Date(0), // Epoch (1970-01-01) marca como "reivindicado/em processamento"
              },
            })

            if (claim.count === 0) {
              // Outra réplica em paralelo já reivindicou esta linha
              continue
            }

            const eventIdStr = String(event.id)
            const headers = {
              "x-outbox-id": eventIdStr,
              ...(typeof event.headers === "object" && event.headers !== null
                ? (event.headers as Record<string, unknown>)
                : { "x-event-version": 1 }),
            }

            await new Promise<void>((resolve, reject) => {
              channel.publish(
                EVENTS_EXCHANGE,
                event.routingKey,
                Buffer.from(JSON.stringify(event.payload)),
                {
                  contentType: "application/json",
                  persistent: true,
                  messageId: eventIdStr,
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

            batchCount++
          } catch (error) {
            const errorMessage = (error as Error).message || String(error)
            const nextRetryCount = (event.retryCount ?? 0) + 1

            this.logger.error(
              `Falha ao processar outbox event #${event.id} (${event.routingKey}) [tentativa ${nextRetryCount}/${MAX_OUTBOX_RETRIES}]: ${errorMessage}`,
            )

            if (nextRetryCount >= MAX_OUTBOX_RETRIES) {
              this.logger.error(
                `ALERTA / METRICA DEAD-LETTER: Outbox event #${event.id} (${event.routingKey}) excedeu o limite maximo de ${MAX_OUTBOX_RETRIES} tentativas. Ultimo erro: ${errorMessage}`,
              )
            }

            // Registra erro e incrementa tentativas na linha da Outbox
            try {
              await db.outboxEvent.update({
                where: { id: event.id },
                data: {
                  publishedAt: null,
                  retryCount: nextRetryCount,
                  lastError: errorMessage,
                },
              })
            } catch {
              // ignora erro ao atualizar estado de falha
            }
          }
        }

        totalPublished += batchCount

        // Se o lote veio cheio (50 itens), continua drenando a fila no mesmo ciclo
        if (pendingEvents.length === 50) {
          this.hasPendingTrigger = true
        }
      } while (this.hasPendingTrigger)

      return totalPublished
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
      channel.on("error", (error) => this.resetChannel(error))
      channel.on("close", () => this.resetChannel())

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

  private resetChannel(error?: Error): void {
    if (error) {
      this.logger.error(
        `Canal AMQP da Outbox encerrado com erro: ${error.message}`,
      )
    }
    this.channel = undefined
    this.connecting = undefined
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
