import type { ClientGrpc } from "@nestjs/microservices"
import { of, throwError } from "rxjs"
import { describe, expect, it, vi } from "vitest"
import { CatalogAdminGatewayService } from "./catalog-admin.service"
import { SectionKind } from "./models/section-kind.enum"

function setup(catalogAdminService: Record<string, unknown>) {
  const client = {
    getService: vi.fn().mockReturnValue(catalogAdminService),
  } as unknown as ClientGrpc
  const service = new CatalogAdminGatewayService(client)
  service.onModuleInit()
  return service
}

function grpcError(details: string) {
  return throwError(() => ({ details }))
}

describe("CatalogAdminGatewayService", () => {
  describe("adminTrack", () => {
    it("devolve null quando o Core responde TRACK_NOT_FOUND", async () => {
      const service = setup({
        getAdminTrack: vi.fn().mockReturnValue(grpcError("TRACK_NOT_FOUND")),
      })

      const result = await service.adminTrack(
        "slug-inexistente",
        "user1",
        "ADMIN",
      )
      expect(result).toBeNull()
    })

    it("relança o erro quando o Core responde FORBIDDEN", async () => {
      const service = setup({
        getAdminTrack: vi.fn().mockReturnValue(grpcError("FORBIDDEN")),
      })

      await expect(
        service.adminTrack("trilha-privada", "user1", "TEACHER"),
      ).rejects.toEqual({ details: "FORBIDDEN" })
    })

    it("relança erros genéricos / transporte", async () => {
      const service = setup({
        getAdminTrack: vi
          .fn()
          .mockReturnValue(throwError(() => new Error("gRPC failure"))),
      })

      await expect(
        service.adminTrack("trilha-1", "user1", "ADMIN"),
      ).rejects.toThrow("gRPC failure")
    })

    it("mapeia detalhes da trilha com sucesso", async () => {
      const service = setup({
        getAdminTrack: vi.fn().mockReturnValue(
          of({
            slug: "trilha-1",
            title: "Trilha 1",
            description: "Descrição",
            creatorCode: "user1",
            lessons: [],
          }),
        ),
      })

      const result = await service.adminTrack("trilha-1", "user1", "ADMIN")
      expect(result).toEqual({
        slug: "trilha-1",
        title: "Trilha 1",
        description: "Descrição",
        creatorCode: "user1",
        lessons: [],
      })
    })
  })

  describe("upsertLesson", () => {
    it("mapeia as seções retornadas pelo RPC", async () => {
      const service = setup({
        upsertLesson: vi.fn().mockReturnValue(
          of({
            slug: "licao-1",
            title: "Lição 1",
            position: 1,
            sections: [
              {
                slug: "sec-1",
                title: "Seção 1",
                position: 1,
                kind: "TEXT",
                contentMarkdown: "md content",
              },
            ],
          }),
        ),
      })

      const result = await service.upsertLesson(
        { trackSlug: "trilha-1", title: "Lição 1" },
        "user1",
        "ADMIN",
      )

      expect(result).toEqual({
        slug: "licao-1",
        title: "Lição 1",
        position: 1,
        sections: [
          {
            slug: "sec-1",
            title: "Seção 1",
            position: 1,
            kind: SectionKind.TEXT,
            contentMarkdown: "md content",
          },
        ],
      })
    })
  })
})
