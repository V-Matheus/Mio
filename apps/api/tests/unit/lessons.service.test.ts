import { SectionKind } from ".prisma/core"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LessonsService } from "../../apps/core/src/modules/catalog/lessons.service"

type PrismaMock = {
  lesson: { findFirst: ReturnType<typeof vi.fn> }
  section: { findFirst: ReturnType<typeof vi.fn> }
}

const dbSections = [
  {
    id: 100n,
    lessonId: 10n,
    slug: "o-que-e-html",
    title: "O que é HTML",
    position: 1,
    kind: SectionKind.TEXT,
    contentMarkdown: "# O que é HTML\n\nConteúdo.",
  },
  {
    id: 101n,
    lessonId: 10n,
    slug: "praticando-html",
    title: "Praticando",
    position: 2,
    kind: SectionKind.EXERCISE,
    contentMarkdown: "# Praticando\n\nExercício.",
  },
]

describe("LessonsService", () => {
  let prisma: PrismaMock
  let service: LessonsService

  beforeEach(() => {
    prisma = { lesson: { findFirst: vi.fn() }, section: { findFirst: vi.fn() } }
    service = new LessonsService(prisma as never)
  })

  describe("getLesson", () => {
    it("rejeita combinação trilha/lição inexistente com LESSON_NOT_FOUND", async () => {
      prisma.lesson.findFirst.mockResolvedValue(null)
      await expect(service.getLesson("front-end", "ghost")).rejects.toThrow(
        "LESSON_NOT_FOUND",
      )
    })

    it("mapeia seções com kind e completed=false (progresso é spec 03)", async () => {
      prisma.lesson.findFirst.mockResolvedValue({
        id: 10n,
        slug: "intro-html",
        title: "Introdução ao HTML",
        sections: dbSections,
      })

      const result = await service.getLesson("front-end", "intro-html")

      expect(prisma.lesson.findFirst).toHaveBeenCalledWith({
        where: { slug: "intro-html", track: { slug: "front-end" } },
        include: { sections: { orderBy: { position: "asc" } } },
      })
      expect(result).toEqual({
        trackSlug: "front-end",
        lessonSlug: "intro-html",
        title: "Introdução ao HTML",
        sections: [
          {
            slug: "o-que-e-html",
            title: "O que é HTML",
            position: 1,
            kind: "TEXT",
            completed: false,
          },
          {
            slug: "praticando-html",
            title: "Praticando",
            position: 2,
            kind: "EXERCISE",
            completed: false,
          },
        ],
      })
    })
  })

  describe("getSection", () => {
    it("rejeita seção inexistente com SECTION_NOT_FOUND", async () => {
      prisma.section.findFirst.mockResolvedValue(null)
      await expect(
        service.getSection("front-end", "intro-html", "ghost"),
      ).rejects.toThrow("SECTION_NOT_FOUND")
    })

    it("devolve o contentMarkdown armazenado no banco", async () => {
      prisma.section.findFirst.mockResolvedValue(dbSections[0])

      const result = await service.getSection(
        "front-end",
        "intro-html",
        "o-que-e-html",
      )

      expect(result).toEqual({
        slug: "o-que-e-html",
        title: "O que é HTML",
        kind: "TEXT",
        contentMarkdown: "# O que é HTML\n\nConteúdo.",
      })
    })
  })
})
