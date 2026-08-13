import { Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
import * as amqp from "amqplib"

export type AmqpConsumerOptions = {
  queue: string
  routingKey: string
  exchange?: string
  exchangeType?: string
  deadLetterExchange?: string
  deadLetterRoutingKey?: string
  deadLetterQueue?: string
  maxRetries?: number
  requeueOnFailure?: boolean
}

export abstract class AmqpConsumerService<TPayload = unknown>
  implements OnModuleInit, OnModuleDestroy
{
  protected readonly logger: Logger
  private connection?: amqp.ChannelModel
  private channel?: amqp.Channel
  private isClosing = false

  constructor(protected readonly options: AmqpConsumerOptions) {
    this.logger = new Logger(this.constructor.name)
  }

  /**
   * Método abstrato executado quando uma mensagem válida é entregue na fila.
   */
  abstract handleMessage(
    payload: TPayload,
    rawMessage: amqp.ConsumeMessage,
  ): Promise<void>

  private reconnectTimer?: NodeJS.Timeout

  async onModuleInit(): Promise<void> {
    await this.startConsumer().catch((err) => {
      this.logger.error(
        `Falha ao iniciar consumidor AMQP na fila ${this.options.queue}: ${(err as Error).message}. Agendando reconexão...`,
      )
      this.scheduleReconnect()
    })
  }

  async onModuleDestroy(): Promise<void> {
    this.isClosing = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    try {
      if (this.channel) {
        await this.channel.close().catch(() => {})
      }
      if (this.connection) {
        await this.connection.close().catch(() => {})
      }
    } catch {
      // Ignora erro de encerramento
    }
  }

  private scheduleReconnect(delayMs = 5000): void {
    if (this.isClosing || this.reconnectTimer) return
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = undefined
      if (this.isClosing) return
      try {
        await this.startConsumer()
      } catch (err) {
        this.logger.error(
          `Tentativa de reconexão AMQP falhou na fila ${this.options.queue}: ${(err as Error).message}. Tentando novamente em ${delayMs / 1000}s...`,
        )
        this.scheduleReconnect(Math.min(delayMs * 1.5, 30000))
      }
    }, delayMs)
  }

  /**
   * Conecta ao broker, configura exchange, fila e binding, e registra o handler.
   */
  async startConsumer(): Promise<void> {
    const url = process.env.RABBITMQ_URL || "amqp://localhost:5672"
    const exchange = this.options.exchange || "mio.events"
    const exchangeType = this.options.exchangeType || "topic"

    try {
      if (this.channel) {
        await this.channel.close().catch(() => {})
        this.channel = undefined
      }
      if (this.connection) {
        await this.connection.close().catch(() => {})
        this.connection = undefined
      }

      this.connection = await amqp.connect(url)
      this.connection.on("error", (err) => {
        if (!this.isClosing) {
          this.logger.error(`Erro na conexão AMQP: ${err.message}`)
          this.scheduleReconnect()
        }
      })
      this.connection.on("close", () => {
        if (!this.isClosing) {
          this.logger.warn("Conexão AMQP fechada. Agendando reconexão...")
          this.scheduleReconnect()
        }
      })

      const channel = await this.connection.createChannel()
      this.channel = channel

      await channel.assertExchange(exchange, exchangeType, {
        durable: true,
      })

      if (this.options.deadLetterExchange) {
        await channel.assertExchange(
          this.options.deadLetterExchange,
          this.options.exchangeType || "topic",
          { durable: true },
        )

        if (this.options.deadLetterQueue) {
          await channel.assertQueue(this.options.deadLetterQueue, {
            durable: true,
          })
          const dlRoutingKey =
            this.options.deadLetterRoutingKey || `${this.options.queue}.dead`
          await channel.bindQueue(
            this.options.deadLetterQueue,
            this.options.deadLetterExchange,
            dlRoutingKey,
          )
        }
      }

      const queueOptions: amqp.Options.AssertQueue = {
        durable: true,
        ...(this.options.deadLetterExchange
          ? {
              deadLetterExchange: this.options.deadLetterExchange,
              deadLetterRoutingKey:
                this.options.deadLetterRoutingKey ||
                `${this.options.queue}.dead`,
            }
          : {}),
      }

      await channel.assertQueue(this.options.queue, queueOptions)
      await channel.bindQueue(
        this.options.queue,
        exchange,
        this.options.routingKey,
      )

      // Vincula a liquidação (ack/nack) à instância do canal capturada antes do consume
      await channel.consume(
        this.options.queue,
        async (msg) => {
          if (!msg) return
          await this.processMessage(channel, msg)
        },
        { noAck: false },
      )

      this.logger.log(
        `Consumidor AMQP ativo na fila "${this.options.queue}" [${this.options.routingKey}]`,
      )
    } catch (err) {
      this.logger.error(
        `Erro ao inicializar canal AMQP: ${(err as Error).message}`,
      )
      throw err
    }
  }

  private async processMessage(
    channel: amqp.Channel,
    msg: amqp.ConsumeMessage,
  ): Promise<void> {
    let payload: TPayload
    try {
      payload = JSON.parse(msg.content.toString()) as TPayload
    } catch (err) {
      this.logger.warn(
        `Mensagem descartada por falha no parse JSON (malformada): ${(err as Error).message}`,
      )
      try {
        // Mensagens malformadas não devem ser reenfileiradas (requeue = false)
        channel.nack(msg, false, false)
      } catch (nackErr) {
        this.logger.warn(
          `Falha ao executar nack de payload malformado: ${(nackErr as Error).message}`,
        )
      }
      return
    }

    try {
      await this.handleMessage(payload, msg)
      try {
        channel.ack(msg)
      } catch (ackErr) {
        this.logger.warn(
          `Falha ao confirmar (ack) mensagem na fila ${this.options.queue}: ${(ackErr as Error).message}`,
        )
      }
    } catch (err) {
      const errorMessage = (err as Error).message || String(err)
      const maxRetries = this.options.maxRetries ?? 3
      const currentRetries = this.extractRetryCount(msg)
      const nextRetryCount = currentRetries + 1

      this.logger.error(
        `Erro ao processar mensagem na fila ${this.options.queue} (tentativa ${nextRetryCount}/${maxRetries}): ${errorMessage}`,
      )

      try {
        if (nextRetryCount < maxRetries) {
          const exchange = this.options.exchange || "mio.events"
          const routingKey = msg.fields?.routingKey || this.options.routingKey
          const headers = {
            ...(msg.properties?.headers || {}),
            "x-retry-count": nextRetryCount,
          }

          channel.publish(exchange, routingKey, msg.content, {
            ...(msg.properties || {}),
            headers,
          })
          channel.ack(msg)
        } else {
          this.logger.error(
            `Mensagem excedeu limite de ${maxRetries} tentativas na fila ${this.options.queue}. Encaminhando para DLQ / descarte definitivo.`,
          )
          channel.nack(msg, false, false)
        }
      } catch (settleErr) {
        this.logger.warn(
          `Falha ao liquidar mensagem na fila ${this.options.queue}: ${(settleErr as Error).message}`,
        )
      }
    }
  }

  private extractRetryCount(msg: amqp.ConsumeMessage): number {
    const headers = msg.properties?.headers || {}
    if (typeof headers["x-retry-count"] === "number") {
      return headers["x-retry-count"]
    }
    if (typeof headers["x-retry-count"] === "string") {
      const parsed = Number.parseInt(headers["x-retry-count"], 10)
      if (!Number.isNaN(parsed)) return parsed
    }
    if (Array.isArray(headers["x-death"]) && headers["x-death"].length > 0) {
      const deathRecord = headers["x-death"][0]
      if (typeof deathRecord?.count === "number") {
        return deathRecord.count
      }
    }
    return 0
  }
}
