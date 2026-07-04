import { SectionKind } from ".prisma/core"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { TrackEntry } from "../../apps/core/scripts/seed-content"
import {
  syncContent,
  validateFixtures,
} from "../../apps/core/scripts/seed-content"
import { catalogFixtures } from "../../apps/core/scripts/seed-fixtures"

afterEach(() => vi.restoreAllMocks())

function makeTree(): TrackEntry[] {
  return [
    {
      slug: "front-end",
      title: "Front-end",
      description: "HTML e CSS",
      lessons: [
        {
          slug: "intro-html",
          title: "Introdução ao HTML",
          position: 1,
          sections: [
            {
              slug: "o-que-e",
              title: "O que é HTML",
              position: 1,
              kind: SectionKind.TEXT,
              contentMarkdown: "# O que é HTML\n\nConteúdo.",
            },
          ],
        },
      ],
    },
  ]
}

describe("validateFixtures", () => {
  it("aceita as fixtures reais do projeto", () => {
    expect(() => validateFixtures(catalogFixtures)).not.toThrow()
  })

  it("as fixtures reais cumprem o critério de aceite (1 trilha, 2 lições, 3 seções cada)", () => {
    const [track] = catalogFixtures
    expect(track?.lessons.length).toBeGreaterThanOrEqual(2)
    for (const lesson of track?.lessons ?? []) {
      expect(lesson.sections.length).toBeGreaterThanOrEqual(3)
    }
  })

  it("rejeita posições de seção duplicadas", () => {
    const tree = makeTree()
    tree[0]?.lessons[0]?.sections.push({
      slug: "outra",
      title: "Outra",
      position: 1,
      kind: SectionKind.TEXT,
      contentMarkdown: "# Outra",
    })
    expect(() => validateFixtures(tree)).toThrow("posições de seção duplicadas")
  })

  it("rejeita slugs de lição duplicados", () => {
    const tree = makeTree()
    const lesson = tree[0]?.lessons[0]
    if (lesson) {
      tree[0]?.lessons.push({ ...lesson, position: 2 })
    }
    expect(() => validateFixtures(tree)).toThrow("slugs de lição duplicados")
  })

  it("rejeita conteúdo vazio", () => {
    const tree = makeTree()
    const section = tree[0]?.lessons[0]?.sections[0]
    if (section) {
      section.contentMarkdown = "   \n"
    }
    expect(() => validateFixtures(tree)).toThrow("Conteúdo vazio")
  })

  it("rejeita posição inválida", () => {
    const tree = makeTree()
    const lesson = tree[0]?.lessons[0]
    if (lesson) {
      lesson.position = 0
    }
    expect(() => validateFixtures(tree)).toThrow("Posição inválida")
  })
})

describe("syncContent", () => {
  function makePrisma() {
    const tx = {
      track: { upsert: vi.fn().mockResolvedValue({ id: 1n }) },
      lesson: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn(),
        upsert: vi.fn().mockResolvedValue({ id: 10n }),
      },
      section: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn(),
        upsert: vi.fn(),
      },
    }
    const prisma = {
      track: { findMany: vi.fn().mockResolvedValue([]) },
      $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
        callback(tx),
      ),
    }
    return { prisma, tx }
  }

  it("faz upsert de track, lesson e section (com contentMarkdown) e devolve o resumo", async () => {
    const { prisma, tx } = makePrisma()

    const summary = await syncContent(prisma as never, makeTree())

    expect(tx.track.upsert).toHaveBeenCalledWith({
      where: { slug: "front-end" },
      create: {
        slug: "front-end",
        title: "Front-end",
        description: "HTML e CSS",
      },
      update: { title: "Front-end", description: "HTML e CSS" },
    })
    expect(tx.lesson.upsert).toHaveBeenCalledWith({
      where: { trackId_slug: { trackId: 1n, slug: "intro-html" } },
      create: {
        trackId: 1n,
        slug: "intro-html",
        title: "Introdução ao HTML",
        position: 1,
      },
      update: { title: "Introdução ao HTML", position: 1 },
    })
    expect(tx.section.upsert).toHaveBeenCalledWith({
      where: { lessonId_slug: { lessonId: 10n, slug: "o-que-e" } },
      create: {
        lessonId: 10n,
        slug: "o-que-e",
        title: "O que é HTML",
        position: 1,
        kind: SectionKind.TEXT,
        contentMarkdown: "# O que é HTML\n\nConteúdo.",
      },
      update: {
        title: "O que é HTML",
        position: 1,
        kind: SectionKind.TEXT,
        contentMarkdown: "# O que é HTML\n\nConteúdo.",
      },
    })
    expect(summary).toEqual({ tracks: 1, lessons: 1, sections: 1 })
  })

  it("nega as posições existentes antes de regravar (reordenação segura)", async () => {
    const { prisma, tx } = makePrisma()

    await syncContent(prisma as never, makeTree())

    expect(tx.lesson.updateMany).toHaveBeenCalledWith({
      where: { trackId: 1n, slug: { in: ["intro-html"] } },
      data: { position: { multiply: -1 } },
    })
    expect(
      tx.lesson.updateMany.mock.invocationCallOrder[0] ?? Infinity,
    ).toBeLessThan(tx.lesson.upsert.mock.invocationCallOrder[0] ?? 0)
    expect(
      tx.section.updateMany.mock.invocationCallOrder[0] ?? Infinity,
    ).toBeLessThan(tx.section.upsert.mock.invocationCallOrder[0] ?? 0)
  })

  it("avisa sobre órfãos sem apagá-los", async () => {
    const { prisma, tx } = makePrisma()
    tx.lesson.findMany.mockResolvedValue([{ slug: "aula-removida" }])
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    await syncContent(prisma as never, makeTree())

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aula-removida"))
  })
})
