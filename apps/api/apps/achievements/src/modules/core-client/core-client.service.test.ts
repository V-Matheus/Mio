import type { ClientGrpc } from "@nestjs/microservices"
import { of, throwError } from "rxjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoreClientService } from "./core-client.service"

describe("CoreClientService", () => {
  let service: CoreClientService
  let progressServiceMock: {
    getStudentProfileProgress: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    progressServiceMock = { getStudentProfileProgress: vi.fn() }
    const clientGrpcMock = {
      getService: vi.fn().mockReturnValue(progressServiceMock),
    } as unknown as ClientGrpc

    service = new CoreClientService(clientGrpcMock)
    service.onModuleInit()
  })

  it("retorna o total de lições concluídas quando a chamada gRPC é bem-sucedida", async () => {
    progressServiceMock.getStudentProfileProgress.mockReturnValue(
      of({ totalCompletedLessons: 18 }),
    )

    expect(await service.getTotalCompletedLessons("usr1")).toBe(18)
    expect(progressServiceMock.getStudentProfileProgress).toHaveBeenCalledWith({
      userCode: "usr1",
    })
  })

  it("resolve para 0 (não lança) quando o Core está indisponível", async () => {
    progressServiceMock.getStudentProfileProgress.mockReturnValue(
      throwError(() => new Error("gRPC unavailable")),
    )

    await expect(service.getTotalCompletedLessons("usr1")).resolves.toBe(0)
  })

  it("resolve para 0 sem chamar o gRPC quando userCode é vazio", async () => {
    expect(await service.getTotalCompletedLessons("")).toBe(0)
    expect(progressServiceMock.getStudentProfileProgress).not.toHaveBeenCalled()
  })
})
