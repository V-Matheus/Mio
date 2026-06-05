import { afterEach, describe, expect, it, vi } from "vitest"

const { connect } = vi.hoisted(() => ({ connect: vi.fn() }))
vi.mock("amqplib", () => ({ connect }))

import { UserEventsPublisher } from "../../apps/core/src/modules/users/events/user-events.publisher"

function makeChannel() {
  return {
    assertExchange: vi.fn().mockResolvedValue(undefined),
    publish: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  }
}

function makeConnection(channel: ReturnType<typeof makeChannel>) {
  return {
    on: vi.fn(),
    createChannel: vi.fn().mockResolvedValue(channel),
    close: vi.fn().mockResolvedValue(undefined),
  }
}

const registered = {
  userCode: "c1",
  email: "a@b.com",
  name: "Victor",
  registeredAt: "2026-01-01T00:00:00.000Z",
}

describe("UserEventsPublisher", () => {
  const originalUrl = process.env.RABBITMQ_URL

  afterEach(() => {
    vi.clearAllMocks()
    if (originalUrl === undefined) {
      process.env.RABBITMQ_URL = undefined
      delete process.env.RABBITMQ_URL
    } else {
      process.env.RABBITMQ_URL = originalUrl
    }
  })

  it("publica user.registered no exchange topic com header de versão", async () => {
    process.env.RABBITMQ_URL = "amqp://localhost"
    const channel = makeChannel()
    connect.mockResolvedValue(makeConnection(channel))

    await new UserEventsPublisher().userRegistered(registered)

    expect(channel.assertExchange).toHaveBeenCalledWith("mio.events", "topic", {
      durable: true,
    })
    expect(channel.publish).toHaveBeenCalledWith(
      "mio.events",
      "user.registered",
      Buffer.from(JSON.stringify(registered)),
      expect.objectContaining({
        contentType: "application/json",
        persistent: true,
        headers: { "x-event-version": 1 },
      }),
    )
  })

  it("usa a routing key correta para password reset", async () => {
    process.env.RABBITMQ_URL = "amqp://localhost"
    const channel = makeChannel()
    connect.mockResolvedValue(makeConnection(channel))

    await new UserEventsPublisher().userPasswordResetRequested({
      userCode: "c1",
      email: "a@b.com",
      resetToken: "tok",
      expiresAt: "2026-01-01T01:00:00.000Z",
    })

    expect(channel.publish.mock.calls[0]?.[1]).toBe(
      "user.password_reset_requested",
    )
  })

  it("conecta uma vez e reusa o canal em publicações subsequentes", async () => {
    process.env.RABBITMQ_URL = "amqp://localhost"
    const channel = makeChannel()
    connect.mockResolvedValue(makeConnection(channel))

    const publisher = new UserEventsPublisher()
    await publisher.userRegistered(registered)
    await publisher.userRegistered(registered)

    expect(connect).toHaveBeenCalledTimes(1)
    expect(channel.publish).toHaveBeenCalledTimes(2)
  })

  it("sem RABBITMQ_URL: não conecta nem publica (no-op)", async () => {
    delete process.env.RABBITMQ_URL
    await new UserEventsPublisher().userRegistered(registered)
    expect(connect).not.toHaveBeenCalled()
  })

  it("falha de conexão é absorvida (evento best-effort, não derruba o request)", async () => {
    process.env.RABBITMQ_URL = "amqp://localhost"
    connect.mockRejectedValue(new Error("broker down"))

    await expect(
      new UserEventsPublisher().userRegistered(registered),
    ).resolves.toBeUndefined()
  })
})
