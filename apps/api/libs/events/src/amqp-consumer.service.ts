import { Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
import * as amqp from "amqplib"

export type AmqpConsumerOptions = {
  queue: string
  routingKey: string
  exchange?: string
  exchangeType?: string
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

      this.channel = await this.connection.createChannel()
      await this.channel.assertExchange(exchange, exchangeType, {
        durable: true,
      })
      await this.channel.assertQueue(this.options.queue, { durable: true })
      await this.channel.bindQueue(
        this.options.queue,
        exchange,
        this.options.routingKey,
      )

      await this.channel.consume(
        this.options.queue,
        async (msg) => {
          if (!msg) return
          await this.processMessage(msg)
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

  private async processMessage(msg: amqp.ConsumeMessage): Promise<void> {
    let payload: TPayload
    try {
      payload = JSON.parse(msg.content.toString()) as TPayload
    } catch (err) {
      this.logger.warn(
        `Mensagem descartada por falha no parse JSON: ${(err as Error).message}`,
      )
      this.channel?.nack(msg, false, false)
      return
    }

    try {
      await this.handleMessage(payload, msg)
      this.channel?.ack(msg)
    } catch (err) {
      this.logger.error(
        `Erro ao processar mensagem na fila ${this.options.queue}: ${(err as Error).message}`,
      )
      this.channel?.nack(msg, false, false)
    }
  }
}
