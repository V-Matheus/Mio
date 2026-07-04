import { beforeEach, describe, expect, it, vi } from "vitest"
import { EnrollmentsService } from "../../apps/core/src/modules/catalog/enrollments.service"

type PrismaMock = {
  user: { findUnique: ReturnType<typeof vi.fn> }
  track: { findUnique: ReturnType<typeof vi.fn> }
  enrollment: { upsert: ReturnType<typeof vi.fn> }
}

describe("EnrollmentsService", () => {
  let prisma: PrismaMock
  let service: EnrollmentsService

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn() },
      track: { findUnique: vi.fn() },
      enrollment: { upsert: vi.fn() },
    }
    service = new EnrollmentsService(prisma as never)
  })

  it("rejeita userCode desconhecido com USER_NOT_FOUND", async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(service.enroll("ghost", "front-end")).rejects.toThrow(
      "USER_NOT_FOUND",
    )
    expect(prisma.enrollment.upsert).not.toHaveBeenCalled()
  })

  it("rejeita trilha desconhecida com TRACK_NOT_FOUND", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1n, code: "user-1" })
    prisma.track.findUnique.mockResolvedValue(null)
    await expect(service.enroll("user-1", "ghost")).rejects.toThrow(
      "TRACK_NOT_FOUND",
    )
    expect(prisma.enrollment.upsert).not.toHaveBeenCalled()
  })

  it("matricula via upsert idempotente (re-matrícula é no-op)", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1n, code: "user-1" })
    prisma.track.findUnique.mockResolvedValue({ id: 7n, slug: "front-end" })

    await service.enroll("user-1", "front-end")

    expect(prisma.enrollment.upsert).toHaveBeenCalledWith({
      where: { userId_trackId: { userId: 1n, trackId: 7n } },
      create: { userId: 1n, trackId: 7n },
      update: {},
    })
  })
})
