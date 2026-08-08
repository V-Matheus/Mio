import type { ClientGrpc } from "@nestjs/microservices"
import { of, throwError } from "rxjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { GamificationGatewayService } from "./gamification.service"
import { Level } from "./gamification.types"

describe("GamificationGatewayService", () => {
  let clientMock: { getService: ReturnType<typeof vi.fn> }
  let grpcServiceMock: {
    getUserXp: ReturnType<typeof vi.fn>
    getLeaderboard: ReturnType<typeof vi.fn>
  }
  let service: GamificationGatewayService

  beforeEach(() => {
    grpcServiceMock = {
      getUserXp: vi.fn(),
      getLeaderboard: vi.fn(),
    }
    clientMock = {
      getService: vi.fn().mockReturnValue(grpcServiceMock),
    }
    service = new GamificationGatewayService(
      clientMock as unknown as ClientGrpc,
    )
    service.onModuleInit()
  })

  describe("getUserXp", () => {
    it("chama gRPC getUserXp e mapeia os campos para o DTO UserXp", async () => {
      grpcServiceMock.getUserXp.mockReturnValue(
        of({
          total: 550,
          level: "JUNIOR",
          progress_to_next: 10,
          xp_to_next_level: 950,
          rank: 3,
        }),
      )

      const result = await service.getUserXp("usr123")

      expect(grpcServiceMock.getUserXp).toHaveBeenCalledWith({
        user_code: "usr123",
      })
      expect(result).toEqual({
        total: 550,
        level: Level.JUNIOR,
        progressToNext: 10,
        xpToNextLevel: 950,
        rank: 3,
      })
    })

    it("lança GraphQLError mapeado com USER_NOT_FOUND", async () => {
      grpcServiceMock.getUserXp.mockReturnValue(
        throwError(() => ({ details: "USER_NOT_FOUND" })),
      )

      await expect(service.getUserXp("usr_not_found")).rejects.toMatchObject({
        message: "Usuário não encontrado",
        extensions: { code: "USER_NOT_FOUND" },
      })
    })

    it("lança GraphQLError genérico quando o código não é reconhecido", async () => {
      grpcServiceMock.getUserXp.mockReturnValue(
        throwError(() => new Error("gRPC unknown error")),
      )

      await expect(service.getUserXp("usr123")).rejects.toMatchObject({
        message: "Erro ao consultar gamificação",
        extensions: { code: "INTERNAL_ERROR" },
      })
    })
  })

  describe("getLeaderboard", () => {
    it("chama gRPC getLeaderboard e mapeia lista de entries", async () => {
      grpcServiceMock.getLeaderboard.mockReturnValue(
        of({
          entries: [
            {
              user_code: "usr1",
              name: "Alice",
              avatar_url: "https://avatar.png",
              total: 1000,
              rank: 1,
              level: "JUNIOR",
            },
            {
              user_code: "usr2",
              name: "Bob",
              avatar_url: "",
              total: 500,
              rank: 2,
              level: "JUNIOR",
            },
          ],
          total_users: 2,
        }),
      )

      const result = await service.getLeaderboard(10, 0)

      expect(grpcServiceMock.getLeaderboard).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      })
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        userCode: "usr1",
        name: "Alice",
        avatarUrl: "https://avatar.png",
        total: 1000,
        rank: 1,
        level: "JUNIOR",
      })
      expect(result[1]).toEqual({
        userCode: "usr2",
        name: "Bob",
        avatarUrl: null,
        total: 500,
        rank: 2,
        level: "JUNIOR",
      })
    })
  })
})
