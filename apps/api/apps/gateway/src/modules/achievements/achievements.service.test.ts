import type { ClientGrpc } from "@nestjs/microservices"
import { of, throwError } from "rxjs"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AchievementsGatewayService } from "./achievements.service"

describe("AchievementsGatewayService", () => {
  let clientMock: { getService: ReturnType<typeof vi.fn> }
  let grpcServiceMock: {
    listAchievements: ReturnType<typeof vi.fn>
    getUserAchievements: ReturnType<typeof vi.fn>
  }
  let service: AchievementsGatewayService

  beforeEach(() => {
    grpcServiceMock = {
      listAchievements: vi.fn(),
      getUserAchievements: vi.fn(),
    }
    clientMock = {
      getService: vi.fn().mockReturnValue(grpcServiceMock),
    }
    service = new AchievementsGatewayService(
      clientMock as unknown as ClientGrpc,
    )
    service.onModuleInit()
  })

  describe("listAchievements", () => {
    it("chama gRPC listAchievements com paginação e mapeia os campos para o DTO Achievement", async () => {
      grpcServiceMock.listAchievements.mockReturnValue(
        of({
          achievements: [
            {
              slug: "first-lesson",
              title: "Primeiro passo",
              description: "Conclua sua primeira lição.",
              iconUrl: "",
              ruleType: "LESSONS_COMPLETED",
              threshold: 1,
            },
          ],
          total: 7,
        }),
      )

      const result = await service.listAchievements(10, 0)

      expect(grpcServiceMock.listAchievements).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      })
      expect(result).toEqual({
        items: [
          {
            slug: "first-lesson",
            title: "Primeiro passo",
            description: "Conclua sua primeira lição.",
            iconUrl: null,
            ruleType: "LESSONS_COMPLETED",
            threshold: 1,
          },
        ],
        total: 7,
      })
    })

    it("lança GraphQLError genérico quando o código não é reconhecido", async () => {
      grpcServiceMock.listAchievements.mockReturnValue(
        throwError(() => new Error("gRPC unknown error")),
      )

      await expect(service.listAchievements(10, 0)).rejects.toMatchObject({
        message: "Erro ao consultar conquistas",
        extensions: { code: "INTERNAL_ERROR" },
      })
    })
  })

  describe("getUserAchievements", () => {
    it("chama gRPC getUserAchievements com paginação e mapeia os campos para o DTO UserAchievement", async () => {
      grpcServiceMock.getUserAchievements.mockReturnValue(
        of({
          entries: [
            {
              slug: "first-lesson",
              title: "Primeiro passo",
              description: "Conclua sua primeira lição.",
              iconUrl: "",
              unlocked: true,
              unlockedAt: "2026-05-11T20:30:06.000Z",
              progress: 1,
              threshold: 1,
            },
            {
              slug: "ten-lessons",
              title: "Maratonista",
              description: "Conclua 10 lições.",
              iconUrl: "",
              unlocked: false,
              unlockedAt: "",
              progress: 1,
              threshold: 10,
            },
          ],
          total: 10,
          unlockedTotal: 1,
        }),
      )

      const result = await service.getUserAchievements("usr123", 10, 0)

      expect(grpcServiceMock.getUserAchievements).toHaveBeenCalledWith({
        userCode: "usr123",
        limit: 10,
        offset: 0,
      })
      expect(result).toEqual({
        items: [
          {
            slug: "first-lesson",
            title: "Primeiro passo",
            description: "Conclua sua primeira lição.",
            iconUrl: null,
            unlocked: true,
            unlockedAt: "2026-05-11T20:30:06.000Z",
            progress: 1,
            threshold: 1,
          },
          {
            slug: "ten-lessons",
            title: "Maratonista",
            description: "Conclua 10 lições.",
            iconUrl: null,
            unlocked: false,
            unlockedAt: null,
            progress: 1,
            threshold: 10,
          },
        ],
        total: 10,
        unlockedTotal: 1,
      })
    })

    it("lança GraphQLError mapeado com INVALID_USER_CODE", async () => {
      grpcServiceMock.getUserAchievements.mockReturnValue(
        throwError(() => ({ details: "INVALID_USER_CODE" })),
      )

      await expect(
        service.getUserAchievements("", 10, 0),
      ).rejects.toMatchObject({
        message: "Código de usuário inválido",
        extensions: { code: "INVALID_USER_CODE" },
      })
    })

    it("lança erro amigável quando a chamada excede o tempo limite", async () => {
      grpcServiceMock.getUserAchievements.mockReturnValue(
        throwError(() => {
          const err = new Error("Timeout")
          err.name = "TimeoutError"
          return err
        }),
      )

      await expect(
        service.getUserAchievements("usr123", 10, 0),
      ).rejects.toMatchObject({
        message: "Conquistas indisponíveis no momento (tempo limite excedido)",
        extensions: { code: "UNAVAILABLE" },
      })
    })
  })
})
