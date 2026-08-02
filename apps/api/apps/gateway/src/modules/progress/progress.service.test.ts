import type { ClientGrpc } from "@nestjs/microservices"
import { of } from "rxjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProgressGatewayService } from "./progress.service"

describe("ProgressGatewayService", () => {
  let clientMock: { getService: ReturnType<typeof vi.fn> }
  let grpcServiceMock: {
    markSectionViewed: ReturnType<typeof vi.fn>
    markLessonCompleted: ReturnType<typeof vi.fn>
    getLessonProgress: ReturnType<typeof vi.fn>
  }
  let service: ProgressGatewayService

  beforeEach(() => {
    grpcServiceMock = {
      markSectionViewed: vi.fn(),
      markLessonCompleted: vi.fn(),
      getLessonProgress: vi.fn(),
    }
    clientMock = {
      getService: vi.fn().mockReturnValue(grpcServiceMock),
    }
    service = new ProgressGatewayService(clientMock as unknown as ClientGrpc)
    service.onModuleInit()
  })

  it("chama gRPC markSectionViewed e retorna resultado", async () => {
    grpcServiceMock.markSectionViewed.mockReturnValue(
      of({ ok: true, lessonCompleted: true }),
    )

    const res = await service.markSectionViewed("usr1", 100)

    expect(res).toEqual({ ok: true, lessonCompleted: true })
    expect(grpcServiceMock.markSectionViewed).toHaveBeenCalledWith({
      userCode: "usr1",
      sectionId: 100,
    })
  })

  it("chama gRPC markLessonCompleted e retorna boolean", async () => {
    grpcServiceMock.markLessonCompleted.mockReturnValue(
      of({ ok: true, lessonCompleted: true }),
    )

    const res = await service.markLessonCompleted("usr1", 10)

    expect(res).toBe(true)
    expect(grpcServiceMock.markLessonCompleted).toHaveBeenCalledWith({
      userCode: "usr1",
      lessonId: 10,
    })
  })

  it("chama gRPC getLessonProgress e retorna progresso", async () => {
    grpcServiceMock.getLessonProgress.mockReturnValue(
      of({
        lastSectionId: 101,
        completedAt: "2026-05-11T20:30:00.000Z",
        viewedSectionIds: [100, 101],
      }),
    )

    const res = await service.getLessonProgress("usr1", 10)

    expect(res).toEqual({
      lastSectionId: 101,
      completedAt: "2026-05-11T20:30:00.000Z",
      viewedSectionIds: [100, 101],
    })
  })
})
