import type { ClientGrpc } from "@nestjs/microservices"
import { of, throwError } from "rxjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { GamificationClientService } from "./gamification-client.service"

describe("GamificationClientService", () => {
  let service: GamificationClientService
  let gamificationServiceMock: {
    getUserXp: ReturnType<typeof vi.fn>
    getUserGamificationProfile: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    gamificationServiceMock = {
      getUserXp: vi.fn(),
      getUserGamificationProfile: vi.fn(),
    }
    const clientGrpcMock = {
      getService: vi.fn().mockReturnValue(gamificationServiceMock),
    } as unknown as ClientGrpc

    service = new GamificationClientService(clientGrpcMock)
    service.onModuleInit()
  })

  describe("getTotalXp", () => {
    it("retorna o total quando a chamada gRPC é bem-sucedida", async () => {
      gamificationServiceMock.getUserXp.mockReturnValue(of({ total: 750 }))

      expect(await service.getTotalXp("usr1")).toBe(750)
      expect(gamificationServiceMock.getUserXp).toHaveBeenCalledWith({
        userCode: "usr1",
      })
    })

    it("resolve para 0 (não lança) quando a Gamification está indisponível", async () => {
      gamificationServiceMock.getUserXp.mockReturnValue(
        throwError(() => new Error("gRPC unavailable")),
      )

      await expect(service.getTotalXp("usr1")).resolves.toBe(0)
    })

    it("resolve para 0 sem chamar o gRPC quando userCode é vazio", async () => {
      expect(await service.getTotalXp("")).toBe(0)
      expect(gamificationServiceMock.getUserXp).not.toHaveBeenCalled()
    })
  })

  describe("getStreakCurrent", () => {
    it("retorna streak.streakCurrent do perfil de gamificação", async () => {
      gamificationServiceMock.getUserGamificationProfile.mockReturnValue(
        of({ streak: { streakCurrent: 5 } }),
      )

      expect(await service.getStreakCurrent("usr1")).toBe(5)
    })

    it("resolve para 0 (não lança) quando a Gamification está indisponível", async () => {
      gamificationServiceMock.getUserGamificationProfile.mockReturnValue(
        throwError(() => new Error("timeout")),
      )

      await expect(service.getStreakCurrent("usr1")).resolves.toBe(0)
    })
  })
})
