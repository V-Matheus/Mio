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
        findFirst: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
      },
      section: {
        findFirst: vi.fn(),
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
        id: 1n,
        slug: "trilha-test",
        creator: { code: "user123" },
      })
      prismaMock.lesson.findFirst.mockResolvedValue({
        id: 10n,
        trackId: 1n,
        slug: "licao-1",
        title: "Título Antigo",
        position: 5,
      })
      prismaMock.lesson.update.mockImplementation(({ data }: any) => ({
        id: 10n,
        slug: "licao-1",
        title: data.title,
        position: data.position,
      }))

      const result = await service.upsertLesson(
        "trilha-test",
        "licao-1",
        "Novo Título",
        0,
        "user123",
        "ADMIN",
      )

      expect(prismaMock.lesson.update).toHaveBeenCalledWith({
        where: { id: 10n },
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
        id: 1n,
        slug: "trilha-test",
        creator: { code: "user123" },
      })
      prismaMock.lesson.findFirst.mockResolvedValue({
        id: 10n,
        trackId: 1n,
        slug: "licao-1",
        title: "Título Antigo",
        position: 5,
      })
      prismaMock.lesson.update.mockImplementation(({ data }: any) => ({
        id: 10n,
        slug: "licao-1",
        title: data.title,
        position: data.position,
      }))

      const result = await service.upsertLesson(
        "trilha-test",
        "licao-1",
        "Novo Título",
        2,
        "user123",
        "ADMIN",
      )

      expect(prismaMock.lesson.update).toHaveBeenCalledWith({
        where: { id: 10n },
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
        id: 1n,
        slug: "trilha-test",
        creator: { code: "user123" },
      })
      prismaMock.lesson.findFirst.mockResolvedValue({
        id: 10n,
        trackId: 1n,
        slug: "licao-1",
        title: "Título Antigo",
        position: 1,
        sections: [
          {
            slug: "sec-1",
            title: "Seção 1",
            position: 1,
            kind: "TEXT",
            contentMarkdown: "md",
          },
        ],
      })
      prismaMock.lesson.update.mockImplementation(({ data }: any) => ({
        id: 10n,
        slug: "licao-1",
        title: data.title,
        position: data.position,
        sections: [
          {
            slug: "sec-1",
            title: "Seção 1",
            position: 1,
            kind: "TEXT",
            contentMarkdown: "md",
          },
        ],
      }))

      const result = await service.upsertLesson(
        "trilha-test",
        "licao-1",
        "Título Atualizado",
        0,
        "user123",
        "ADMIN",
      )

      expect(result.sections).toHaveLength(1)
      expect(result.sections[0]).toEqual({
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
      prismaMock.track.findUnique.mockResolvedValue({
        id: 1n,
        slug: "trilha-test",
        creator: { code: "user123" },
      })
      prismaMock.lesson.findFirst.mockResolvedValue({
        id: 10n,
        trackId: 1n,
        slug: "licao-1",
      })
      prismaMock.section.findFirst.mockResolvedValue({
        id: 100n,
        lessonId: 10n,
        slug: "secao-1",
        title: "Título Antigo",
        position: 3,
        kind: "TEXT",
        contentMarkdown: "Conteúdo antigo",
      })
      prismaMock.section.update.mockImplementation(({ data }: any) => ({
        id: 100n,
        slug: "secao-1",
        title: data.title,
        position: data.position,
        kind: data.kind,
        contentMarkdown: data.contentMarkdown,
      }))

      const result = await service.upsertSection(
        "trilha-test",
        "licao-1",
        "secao-1",
        "Novo Título Seção",
        0,
        "TEXT",
        "Novo conteúdo",
        "user123",
        "ADMIN",
      )

      expect(prismaMock.section.update).toHaveBeenCalledWith({
        where: { id: 100n },
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
