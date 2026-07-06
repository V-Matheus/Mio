import type { ClientGrpc } from "@nestjs/microservices"
import type { GraphQLError } from "graphql"
import { of, throwError } from "rxjs"
import { describe, expect, it, vi } from "vitest"
import { CatalogService } from "./catalog.service"
import { SectionKind } from "./models/section-kind.enum"

function setup(catalogService: Record<string, unknown>) {
  const client = {
    getService: vi.fn().mockReturnValue(catalogService),
  } as unknown as ClientGrpc
  const service = new CatalogService(client)
  service.onModuleInit()
  return service
}

function grpcError(details: string) {
  return throwError(() => ({ details }))
}

describe("CatalogService", () => {
  describe("tracks", () => {
    it("normaliza defaults do proto3 (lista vazia, campos omitidos)", async () => {
      const service = setup({
        listTracks: vi.fn().mockReturnValue(of({})),
      })
      await expect(service.tracks()).resolves.toEqual([])
    })

    it("mapeia campos e envia userCode vazio para anônimo", async () => {
      const listTracks = vi.fn().mockReturnValue(
        of({
          tracks: [
            { slug: "front-end", title: "Front-end", lessonCount: 2 },
            {
              slug: "back-end",
              title: "Back-end",
              description: "APIs",
              enrolled: true,
            },
          ],
        }),
      )
      const service = setup({ listTracks })

      const result = await service.tracks()

      expect(listTracks).toHaveBeenCalledWith({ userCode: "" })
      expect(result).toEqual([
        {
          slug: "front-end",
          title: "Front-end",
          description: null,
          lessonCount: 2,
          enrolled: false,
        },
        {
          slug: "back-end",
          title: "Back-end",
          description: "APIs",
          lessonCount: 0,
          enrolled: true,
        },
      ])
    })
  })

  describe("track", () => {
    it("devolve null quando o Core responde TRACK_NOT_FOUND", async () => {
      const service = setup({
        getTrack: vi.fn().mockReturnValue(grpcError("TRACK_NOT_FOUND")),
      })
      await expect(service.track("ghost")).resolves.toBeNull()
    })

    it("mapeia detalhe com lições", async () => {
      const service = setup({
        getTrack: vi.fn().mockReturnValue(
          of({
            slug: "front-end",
            title: "Front-end",
            lessons: [
              { slug: "intro-html", title: "HTML", position: 1 },
              { slug: "intro-css", title: "CSS", position: 2, completed: true },
            ],
            enrolled: true,
          }),
        ),
      })

      const result = await service.track("front-end", "user-1")

      expect(result).toEqual({
        slug: "front-end",
        title: "Front-end",
        description: null,
        lessons: [
          { slug: "intro-html", title: "HTML", position: 1, completed: false },
          { slug: "intro-css", title: "CSS", position: 2, completed: true },
        ],
        enrolled: true,
      })
    })
  })

  describe("section", () => {
    it("mapeia kind para o enum e devolve o markdown", async () => {
      const service = setup({
        getSection: vi.fn().mockReturnValue(
          of({
            slug: "pratica",
            title: "Praticando",
            kind: "EXERCISE",
            contentMarkdown: "# Praticando",
          }),
        ),
      })

      const result = await service.section("front-end", "intro-html", "pratica")

      expect(result).toEqual({
        slug: "pratica",
        title: "Praticando",
        kind: SectionKind.EXERCISE,
        contentMarkdown: "# Praticando",
      })
    })

    it("devolve null para SECTION_NOT_FOUND", async () => {
      const service = setup({
        getSection: vi.fn().mockReturnValue(grpcError("SECTION_NOT_FOUND")),
      })
      await expect(
        service.section("front-end", "intro-html", "ghost"),
      ).resolves.toBeNull()
    })
  })

  describe("enrollInTrack", () => {
    it("matricula e devolve true", async () => {
      const enrollUser = vi.fn().mockReturnValue(of({ ok: true }))
      const service = setup({ enrollUser })

      await expect(service.enrollInTrack("user-1", "front-end")).resolves.toBe(
        true,
      )
      expect(enrollUser).toHaveBeenCalledWith({
        userCode: "user-1",
        trackSlug: "front-end",
      })
    })

    it("mapeia erro de domínio para GraphQLError com code", async () => {
      const service = setup({
        enrollUser: vi.fn().mockReturnValue(grpcError("USER_NOT_FOUND")),
      })
      try {
        await service.enrollInTrack("ghost", "front-end")
        expect.unreachable("deveria ter lançado")
      } catch (error) {
        expect((error as GraphQLError).extensions.code).toBe("USER_NOT_FOUND")
      }
    })

    it("erro desconhecido vira INTERNAL_ERROR", async () => {
      const service = setup({
        enrollUser: vi.fn().mockReturnValue(grpcError("14 UNAVAILABLE")),
      })
      try {
        await service.enrollInTrack("user-1", "front-end")
        expect.unreachable("deveria ter lançado")
      } catch (error) {
        expect((error as GraphQLError).extensions.code).toBe("INTERNAL_ERROR")
      }
    })
  })
})
