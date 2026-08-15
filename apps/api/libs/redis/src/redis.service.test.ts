import { beforeEach, describe, expect, it, vi } from "vitest"
import { RedisService } from "./redis.service"

vi.mock("ioredis", () => {
  return {
    default: class MockRedis {
      status = "ready"
      on = vi.fn()
      connect = vi.fn().mockResolvedValue(undefined)
      quit = vi.fn().mockResolvedValue("OK")
      disconnect = vi.fn()
      zadd = vi.fn().mockResolvedValue(1)
      zrevrank = vi.fn().mockResolvedValue(0)
      zcard = vi.fn().mockResolvedValue(10)
      zrevrange = vi.fn().mockResolvedValue(["user-1", "500", "user-2", "300"])
      publish = vi.fn().mockResolvedValue(1)
      rename = vi.fn().mockResolvedValue("OK")
      del = vi.fn().mockResolvedValue(1)
      get = vi.fn().mockResolvedValue("val")
      set = vi.fn().mockResolvedValue("OK")
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

  it("zrevrangeWithScores formata pares em lista de objetos e suporta notacao cientifica", async () => {
    const client = service.getClient()
    vi.spyOn(client, "zrevrange").mockResolvedValueOnce([
      "user-admin",
      "1.2500821360145954e+4",
      "user-1",
      "500.5",
    ] as never)

    const list = await service.zrevrangeWithScores("mio:xp:global", 0, 9)
    expect(list[0]?.member).toBe("user-admin")
    expect(Math.floor(list[0]?.score ?? 0)).toBe(12500)
    expect(list[1]?.member).toBe("user-1")
    expect(Math.floor(list[1]?.score ?? 0)).toBe(500)
  })

  it("zcard retorna contagem total de membros", async () => {
    const total = await service.zcard("mio:xp:global")
    expect(total).toBe(10)
  })

  it("zadd executa zadd sem flag GT", async () => {
    const client = service.getClient()
    await service.zadd("mio:xp:global:tmp", 300, "usr1")
    expect(client.zadd).toHaveBeenCalledWith("mio:xp:global:tmp", 300, "usr1")
  })

  it("rename executa rename de chave de forma atomica", async () => {
    const client = service.getClient()
    await service.rename("mio:xp:global:tmp", "mio:xp:global")
    expect(client.rename).toHaveBeenCalledWith(
      "mio:xp:global:tmp",
      "mio:xp:global",
    )
  })

  it("del remove chaves especificadas", async () => {
    const client = service.getClient()
    const count = await service.del("mio:xp:global")
    expect(client.del).toHaveBeenCalledWith("mio:xp:global")
    expect(count).toBe(1)
  })

  it("publish despacha mensagem para canal", async () => {
    const res = await service.publish("mio:user:123", '{"test":true}')
    expect(res).toBe(1)
  })

  it("onModuleDestroy executa quit quando o cliente estiver ready", async () => {
    const client = service.getClient()
    client.status = "ready"
    await service.onModuleDestroy()
    expect(client.quit).toHaveBeenCalled()
    expect(client.disconnect).not.toHaveBeenCalled()
  })

  it("onModuleDestroy executa disconnect quando o cliente estiver em reconnecting", async () => {
    const client = service.getClient()
    client.status = "reconnecting"
    await service.onModuleDestroy()
    expect(client.disconnect).toHaveBeenCalled()
    expect(client.quit).not.toHaveBeenCalled()
  })

  it("get busca valor de chave", async () => {
    const client = service.getClient()
    const val = await service.get("test-key")
    expect(client.get).toHaveBeenCalledWith("test-key")
    expect(val).toBe("val")
  })

  it("set grava chave com ou sem TTL", async () => {
    const client = service.getClient()
    await service.set("key1", "val1")
    expect(client.set).toHaveBeenCalledWith("key1", "val1")

    await service.set("key2", "val2", 3600)
    expect(client.set).toHaveBeenCalledWith("key2", "val2", "EX", 3600)
  })

  it("onModuleDestroy faz fallback para disconnect quando quit falha", async () => {
    const client = service.getClient()
    client.status = "ready"
    vi.spyOn(client, "quit").mockRejectedValueOnce(
      new Error("Connection error"),
    )
    await service.onModuleDestroy()
    expect(client.quit).toHaveBeenCalled()
    expect(client.disconnect).toHaveBeenCalled()
  })
})
