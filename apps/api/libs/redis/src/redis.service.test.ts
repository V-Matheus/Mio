import { beforeEach, describe, expect, it, vi } from "vitest"
import { RedisService } from "./redis.service"

vi.mock("ioredis", () => {
  return {
    default: class MockRedis {
      on = vi.fn()
      connect = vi.fn().mockResolvedValue(undefined)
      quit = vi.fn().mockResolvedValue("OK")
      disconnect = vi.fn()
      zadd = vi.fn().mockResolvedValue(1)
      zrevrank = vi.fn().mockResolvedValue(0)
      zcard = vi.fn().mockResolvedValue(10)
      zrevrange = vi.fn().mockResolvedValue(["user-1", "500", "user-2", "300"])
      publish = vi.fn().mockResolvedValue(1)
    },
  }
})

describe("RedisService (shared lib)", () => {
  let service: RedisService

  beforeEach(() => {
    service = new RedisService()
  })

  it("zaddGreater executa zadd com flag GT", async () => {
    const client = service.getClient()
    await service.zaddGreater("mio:xp:global", 500, "usr1")
    expect(client.zadd).toHaveBeenCalledWith("mio:xp:global", "GT", 500, "usr1")
  })

  it("zrevrank1Based converte rank base 0 do redis para base 1", async () => {
    const rank = await service.zrevrank1Based("mio:xp:global", "usr1")
    expect(rank).toBe(1)
  })

  it("zrevrank1Based retorna 0 se nao encontrado", async () => {
    const client = service.getClient()
    vi.spyOn(client, "zrevrank").mockResolvedValueOnce(null as never)
    const rank = await service.zrevrank1Based("mio:xp:global", "usr999")
    expect(rank).toBe(0)
  })

  it("zrevrangeWithScores formata pares em lista de objetos", async () => {
    const list = await service.zrevrangeWithScores("mio:xp:global", 0, 9)
    expect(list).toEqual([
      { member: "user-1", score: 500 },
      { member: "user-2", score: 300 },
    ])
  })

  it("zcard retorna contagem total de membros", async () => {
    const total = await service.zcard("mio:xp:global")
    expect(total).toBe(10)
  })

  it("publish despacha mensagem para canal", async () => {
    const res = await service.publish("mio:user:123", '{"test":true}')
    expect(res).toBe(1)
  })
})
