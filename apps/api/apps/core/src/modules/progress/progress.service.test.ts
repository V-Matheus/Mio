import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProgressService } from "./progress.service"

describe("ProgressService", () => {
  let prismaMock: {
    user: { findUnique: ReturnType<typeof vi.fn> }
    section: { findUnique: ReturnType<typeof vi.fn> }
    lesson: { findUnique: ReturnType<typeof vi.fn> }
    sectionView: {
      findMany: ReturnType<typeof vi.fn>
      upsert?: ReturnType<typeof vi.fn>
      count?: ReturnType<typeof vi.fn>
    }
    lessonProgress: {
      findUnique: ReturnType<typeof vi.fn>
      create?: ReturnType<typeof vi.fn>
      update?: ReturnType<typeof vi.fn>
      upsert?: ReturnType<typeof vi.fn>
    }
    outboxEvent?: { create: ReturnType<typeof vi.fn> }
    $transaction: ReturnType<typeof vi.fn>
  }
  let service: ProgressService

  beforeEach(() => {
    prismaMock = {
      user: { findUnique: vi.fn() },
      section: { findUnique: vi.fn() },
      lesson: { findUnique: vi.fn() },
      sectionView: { findMany: vi.fn() },
      lessonProgress: { findUnique: vi.fn() },
      $transaction: vi.fn((cb: (tx: unknown) => unknown) => cb(prismaMock)),
    }
    service = new ProgressService(prismaMock as never)
  })

  describe("markSectionViewed", () => {
    it("lança exceção se usuário não for encontrado", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      await expect(service.markSectionViewed("usr1", 100)).rejects.toThrow(
        "Usuário não encontrado: usr1",
      )
    })

    it("lança exceção se seção não for encontrada", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, code: "usr1" })
      prismaMock.section.findUnique.mockResolvedValue(null)

      await expect(service.markSectionViewed("usr1", 100)).rejects.toThrow(
        "Seção não encontrada ID: 100",
      )
    })

    it("marca seção vista e não conclui lição se restarem seções não vistas", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, code: "usr1" })
      prismaMock.section.findUnique.mockResolvedValue({
        id: 10,
        lessonId: 100,
        slug: "sec-1",
        lesson: {
          id: 100,
          slug: "les-1",
          trackId: 1000,
          track: { slug: "tril-1" },
          sections: [{ id: 10 }, { id: 11 }],
        },
      })
      prismaMock.sectionView = {
        findMany: vi.fn(),
        upsert: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(1),
      }
      prismaMock.lessonProgress = {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      }

      const result = await service.markSectionViewed("usr1", 10)

      expect(result).toEqual({ ok: true, lessonCompleted: false })
      expect(prismaMock.sectionView.upsert).toHaveBeenCalled()
      expect(prismaMock.lessonProgress.create).toHaveBeenCalled()
    })

    it("conclui a lição e cria OutboxEvent quando a última seção é vista", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, code: "usr1" })
      prismaMock.section.findUnique.mockResolvedValue({
        id: 11,
        lessonId: 100,
        slug: "sec-2",
        lesson: {
          id: 100,
          slug: "les-1",
          trackId: 1000,
          track: { slug: "tril-1" },
          sections: [{ id: 10 }, { id: 11 }],
        },
      })
      prismaMock.sectionView = {
        findMany: vi.fn(),
        upsert: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(2),
      }
      prismaMock.lessonProgress = {
        findUnique: vi.fn().mockResolvedValue({ id: 50, completedAt: null }),
        update: vi.fn().mockResolvedValue({}),
        upsert: vi.fn().mockResolvedValue({}),
      }
      prismaMock.outboxEvent = {
        create: vi.fn().mockResolvedValue({}),
      }

      const result = await service.markSectionViewed("usr1", 11)

      expect(result).toEqual({ ok: true, lessonCompleted: true })
      expect(prismaMock.outboxEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            routingKey: "lesson.completed",
            payload: expect.objectContaining({
              userCode: "usr1",
              trackSlug: "tril-1",
              lessonSlug: "les-1",
            }),
          }),
        }),
      )
    })
  })

  describe("markLessonCompleted", () => {
    it("marca lição como concluída e cria outbox event se ainda não concluída", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, code: "usr1" })
      prismaMock.lesson.findUnique.mockResolvedValue({
        id: 100,
        trackId: 1000,
        slug: "les-1",
        track: { slug: "tril-1" },
      })
      prismaMock.lessonProgress = {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      }
      prismaMock.outboxEvent = {
        create: vi.fn().mockResolvedValue({}),
      }

      const result = await service.markLessonCompleted("usr1", 100)

      expect(result).toEqual({ ok: true, lessonCompleted: true })
      expect(prismaMock.outboxEvent.create).toHaveBeenCalled()
    })

    it("é idempotente e não recria outbox event se lição já estava concluída", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, code: "usr1" })
      prismaMock.lesson.findUnique.mockResolvedValue({
        id: 100,
        trackId: 1000,
        slug: "les-1",
        track: { slug: "tril-1" },
      })
      prismaMock.lessonProgress = {
        findUnique: vi.fn().mockResolvedValue({ completedAt: new Date() }),
      }
      prismaMock.outboxEvent = {
        create: vi.fn(),
      }

      const result = await service.markLessonCompleted("usr1", 100)

      expect(result).toEqual({ ok: true, lessonCompleted: false })
      expect(prismaMock.outboxEvent.create).not.toHaveBeenCalled()
    })
  })

  describe("getLessonProgress", () => {
    it("retorna as seções vistas e última seção por IDs", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, code: "usr1" })
      prismaMock.lesson.findUnique.mockResolvedValue({
        id: 100,
        sections: [{ id: 10 }, { id: 11 }],
      })
      prismaMock.lessonProgress.findUnique.mockResolvedValue({
        lastSectionId: 11,
        completedAt: new Date("2026-05-11T20:30:00.000Z"),
      })
      prismaMock.sectionView.findMany.mockResolvedValue([
        { sectionId: 10 },
        { sectionId: 11 },
      ])

      const res = await service.getLessonProgress("usr1", 100)

      expect(res).toEqual({
        lastSectionId: 11,
        completedAt: "2026-05-11T20:30:00.000Z",
        viewedSectionIds: [10, 11],
      })
    })
  })
})
