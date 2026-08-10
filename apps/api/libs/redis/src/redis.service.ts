import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common"
import Redis, { type Redis as RedisClient } from "ioredis"

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client!: RedisClient
  private isConnected = false

  constructor() {
    const url = process.env.REDIS_URL || "redis://localhost:6379"
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        return Math.min(times * 100, 3000)
      },
    })

    this.client.on("connect", () => {
      this.isConnected = true
      this.logger.log("Conectado ao Redis com sucesso")
    })

    this.client.on("error", (err) => {
      this.isConnected = false
      this.logger.error(`Erro na conexão com Redis: ${err.message}`)
    })

    this.client.on("close", () => {
      this.isConnected = false
      this.logger.warn("Conexão com Redis encerrada")
    })
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect()
    } catch (err) {
      this.logger.warn(
        `Falha na conexão inicial com o Redis: ${(err as Error).message}`,
      )
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit()
      } catch {
        this.client.disconnect()
      }
    }
  }

  /**
   * Retorna a instância nativa do cliente ioredis.
   */
  getClient(): RedisClient {
    return this.client
  }

  /**
   * Atualiza a pontuação no Sorted Set apenas se o novo valor for maior que o atual (GT).
   */
  async zaddGreater(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, "GT", score, member)
  }

  /**
   * Obtém a posição invertida (1-based rank onde maior score = rank 1).
   * Retorna 0 se o membro não for encontrado.
   */
  async zrevrank1Based(key: string, member: string): Promise<number> {
    const zeroBasedRank = await this.client.zrevrank(key, member)
    if (zeroBasedRank === null || zeroBasedRank === undefined) {
      return 0
    }
    return zeroBasedRank + 1
  }

  /**
   * Retorna o total de membros no conjunto ordenado.
   */
  async zcard(key: string): Promise<number> {
    return await this.client.zcard(key)
  }

  /**
   * Retorna o intervalo com membros e pontuações em ordem decrescente.
   */
  async zrevrangeWithScores(
    key: string,
    start: number,
    stop: number,
  ): Promise<Array<{ member: string; score: number }>> {
    const results = await this.client.zrevrange(key, start, stop, "WITHSCORES")
    const entries: Array<{ member: string; score: number }> = []

    for (let i = 0; i < results.length; i += 2) {
      const member = results[i]
      const scoreStr = results[i + 1]
      if (member && scoreStr !== undefined) {
        entries.push({
          member,
          score: Number.parseFloat(scoreStr) || 0,
        })
      }
    }

    return entries
  }

  /**
   * Publica uma mensagem em um canal Pub/Sub do Redis.
   */
  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message)
  }
}
