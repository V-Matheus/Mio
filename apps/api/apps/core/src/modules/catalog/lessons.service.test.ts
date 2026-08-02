import { SectionKind } from ".prisma/core"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LessonsService } from "./lessons.service"

type PrismaMock = {
  lesson: { findFirst: ReturnType<typeof vi.fn> }
  section: { findFirst: ReturnType<typeof vi.fn> }
  enrollment: { findFirst: ReturnType<typeof vi.fn> }
  sectionView: { findMany: ReturnType<typeof vi.fn> }
}

const dbSections = [
  {
    id: 100,
    lessonId: 10,
    slug: "o-que-e-html",
    title: "O que é HTML",
    position: 1,
    kind: SectionKind.TEXT,
    contentMarkdown: "# O que é HTML\n\nConteúdo.",
  },
  {
    id: 101,
    lessonId: 10,
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
    prisma = {
      lesson: { findFirst: vi.fn() },
      section: { findFirst: vi.fn() },
      enrollment: { findFirst: vi.fn() },
      sectionView: { findMany: vi.fn().mockResolvedValue([]) },
    }
    service = new LessonsService(prisma as never)
  })

  describe("getLesson", () => {
    it("rejeita combinação trilha/lição inexistente com LESSON_NOT_FOUND", async () => {
      prisma.lesson.findFirst.mockResolvedValue(null)
      await expect(service.getLesson("front-end", "ghost")).rejects.toThrow(
        "LESSON_NOT_FOUND",
      )
    })

    it("rejeita acesso se usuário não estiver autenticado ou matriculado com FORBIDDEN", async () => {
      prisma.lesson.findFirst.mockResolvedValue({
        id: 10,
        trackId: 1,
        slug: "intro-html",
        sections: dbSections,
      })
      prisma.enrollment.findFirst.mockResolvedValue(null)

      await expect(
        service.getLesson("front-end", "intro-html", "usr1"),
      ).rejects.toThrow("FORBIDDEN")
    })

    it("mapeia seções com kind quando usuário estiver matriculado", async () => {
      prisma.lesson.findFirst.mockResolvedValue({
        id: 10,
        trackId: 1,
        slug: "intro-html",
        title: "Introdução ao HTML",
        sections: dbSections,
      })
      prisma.enrollment.findFirst.mockResolvedValue({ id: BigInt(1) })

      const result = await service.getLesson("front-end", "intro-html", "usr1")

      expect(result).toEqual({
        id: 10,
        trackSlug: "front-end",
        lessonSlug: "intro-html",
        title: "Introdução ao HTML",
        sections: [
          {
            id: 100,
            slug: "o-que-e-html",
            title: "O que é HTML",
            position: 1,
            kind: "TEXT",
            completed: false,
          },
          {
            id: 101,
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

    it("rejeita acesso se usuário não estiver matriculado com FORBIDDEN", async () => {
      prisma.section.findFirst.mockResolvedValue({
        ...dbSections[0],
        lesson: { trackId: 1 },
      })
      prisma.enrollment.findFirst.mockResolvedValue(null)

      await expect(
        service.getSection("front-end", "intro-html", "o-que-e-html", "usr1"),
      ).rejects.toThrow("FORBIDDEN")
    })

    it("devolve o contentMarkdown armazenado no banco quando matriculado", async () => {
      prisma.section.findFirst.mockResolvedValue({
        ...dbSections[0],
        lesson: { trackId: 1 },
      })
      prisma.enrollment.findFirst.mockResolvedValue({ id: BigInt(1) })

      const result = await service.getSection(
        "front-end",
        "intro-html",
        "o-que-e-html",
        "usr1",
      )

      expect(result).toEqual({
        id: 100,
        slug: "o-que-e-html",
        title: "O que é HTML",
        kind: "TEXT",
        contentMarkdown: "# O que é HTML\n\nConteúdo.",
      })
    })
  })
})
