import { beforeEach, describe, expect, it, vi } from "vitest"
import { CatalogAdminService } from "./catalog-admin.service"

describe("CatalogAdminService", () => {
  let service: CatalogAdminService
  let prismaMock: any

  beforeEach(() => {
    prismaMock = {
      track: {
        findUnique: vi.fn(),
      },
      lesson: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
      },
      section: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
      },
    }
    service = new CatalogAdminService(prismaMock)
  })

  describe("upsertLesson", () => {
    it("preserva a posição existente quando position é 0 ao atualizar lição", async () => {
      prismaMock.track.findUnique.mockResolvedValue({
        id: 1,
        slug: "trilha-test",
        creator: { code: "user123" },
      })
      prismaMock.lesson.findMany.mockResolvedValue([
        {
          id: 10,
          trackId: 1,
          slug: "licao-1",
          title: "Título Antigo",
          position: 5,
        },
      ])
      prismaMock.lesson.update.mockImplementation(({ data }: any) => ({
        id: 10,
        slug: "licao-1",
        title: data.title,
        position: data.position,
      }))

      const result = await service.upsertLesson(
        1,
        10,
        "Novo Título",
        0,
        "user123",
        "ADMIN",
      )

      expect(prismaMock.lesson.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          title: "Novo Título",
          position: 5,
        },
        include: { sections: { orderBy: { position: "asc" } } },
      })
      expect(result.position).toBe(5)
    })

    it("atualiza a posição quando uma nova posição válida é fornecida", async () => {
      prismaMock.track.findUnique.mockResolvedValue({
        id: 1,
        slug: "trilha-test",
        creator: { code: "user123" },
      })
      prismaMock.lesson.findMany.mockResolvedValue([
        {
          id: 10,
          trackId: 1,
          slug: "licao-1",
          title: "Título Antigo",
          position: 5,
        },
      ])
      prismaMock.lesson.update.mockImplementation(({ data }: any) => ({
        id: 10,
        slug: "licao-1",
        title: data.title,
        position: data.position,
      }))

      const result = await service.upsertLesson(
        1,
        10,
        "Novo Título",
        2,
        "user123",
        "ADMIN",
      )

      expect(prismaMock.lesson.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          title: "Novo Título",
          position: 2,
        },
        include: { sections: { orderBy: { position: "asc" } } },
      })
      expect(result.position).toBe(2)
    })

    it("retorna as seções existentes ao atualizar uma lição que já possui seções", async () => {
      prismaMock.track.findUnique.mockResolvedValue({
        id: 1,
        slug: "trilha-test",
        creator: { code: "user123" },
      })
      prismaMock.lesson.findMany.mockResolvedValue([
        {
          id: 10,
          trackId: 1,
          slug: "licao-1",
          title: "Título Antigo",
          position: 1,
        },
      ])
      prismaMock.lesson.update.mockImplementation(({ data }: any) => ({
        id: 10,
        slug: "licao-1",
        title: data.title,
        position: data.position,
        sections: [
          {
            id: 100,
            slug: "sec-1",
            title: "Seção 1",
            position: 1,
            kind: "TEXT",
            contentMarkdown: "md",
          },
        ],
      }))

      const result = await service.upsertLesson(
        1,
        10,
        "Título Atualizado",
        0,
        "user123",
        "ADMIN",
      )

      expect(result.sections).toHaveLength(1)
      expect(result.sections[0]).toEqual({
        id: 100,
        slug: "sec-1",
        title: "Seção 1",
        position: 1,
        kind: "TEXT",
        contentMarkdown: "md",
      })
    })
  })

  describe("upsertSection", () => {
    it("preserva a posição existente quando position é 0 ao atualizar seção", async () => {
      prismaMock.lesson.findUnique.mockResolvedValue({
        id: 10,
        trackId: 1,
        slug: "licao-1",
        track: { id: 1, slug: "trilha-test", creator: { code: "user123" } },
        sections: [
          {
            id: 100,
            lessonId: 10,
            slug: "secao-1",
            title: "Título Antigo",
            position: 3,
            kind: "TEXT",
            contentMarkdown: "Conteúdo antigo",
          },
        ],
      })
      prismaMock.section.update.mockImplementation(({ data }: any) => ({
        id: 100,
        slug: "secao-1",
        title: data.title,
        position: data.position,
        kind: data.kind,
        contentMarkdown: data.contentMarkdown,
      }))

      const result = await service.upsertSection(
        10,
        100,
        "Novo Título Seção",
        0,
        "TEXT",
        "Novo conteúdo",
        "user123",
        "ADMIN",
      )

      expect(prismaMock.section.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: {
          title: "Novo Título Seção",
          position: 3,
          kind: "TEXT",
          contentMarkdown: "Novo conteúdo",
        },
      })
      expect(result.position).toBe(3)
    })
  })
})
