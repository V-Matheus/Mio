import { beforeEach, describe, expect, it, vi } from "vitest"
import { UserEventsPublisher } from "./user-events.publisher"

describe("UserEventsPublisher", () => {
  let eventPublisherMock: {
    publish: ReturnType<typeof vi.fn>
  }
  let prismaMock: object
  let publisher: UserEventsPublisher

  beforeEach(() => {
    eventPublisherMock = {
      publish: vi.fn().mockResolvedValue(undefined),
    }
    prismaMock = {}
    publisher = new UserEventsPublisher(
      eventPublisherMock as never,
      prismaMock as never,
    )
  })

  it("publica evento user.registered delegando ao EventPublisherService", async () => {
    const payload = {
      userCode: "c1",
      email: "a@b.com",
      name: "Victor",
      registeredAt: "2026-01-01T00:00:00.000Z",
    }

    await publisher.userRegistered(payload)

    expect(eventPublisherMock.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        routingKey: "user.registered",
        payload,
      }),
      { client: prismaMock },
    )
  })

  it("publica evento user.password_reset_requested delegando ao EventPublisherService", async () => {
    const payload = {
      userCode: "c1",
      email: "a@b.com",
      resetToken: "tok",
      expiresAt: "2026-01-01T01:00:00.000Z",
    }

    await publisher.userPasswordResetRequested(payload)

    expect(eventPublisherMock.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        routingKey: "user.password_reset_requested",
        payload,
      }),
      { client: prismaMock },
    )
  })
})
