import { beforeEach, describe, expect, it, vi } from "vitest"
import { TracksService } from "../../apps/core/src/modules/catalog/tracks.service"

type PrismaMock = {
  track: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
  }
  enrollment: { findMany: ReturnType<typeof vi.fn> }
  lessonProgress: { findMany: ReturnType<typeof vi.fn> }
}

function makePrisma(): PrismaMock {
  return {
    track: { findMany: vi.fn(), findUnique: vi.fn() },
    enrollment: { findMany: vi.fn().mockResolvedValue([]) },
    lessonProgress: { findMany: vi.fn().mockResolvedValue([]) },
  }
}

const dbTrack = {
  id: 1n,
  slug: "front-end",
  title: "Fundamentos de Front-end",
  description: "HTML e CSS do zero.",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
}

const dbLessons = [
  { id: 10n, trackId: 1n, slug: "intro-html", title: "HTML", position: 1 },
  { id: 11n, trackId: 1n, slug: "intro-css", title: "CSS", position: 2 },
]

describe("TracksService", () => {
  let prisma: PrismaMock
  let service: TracksService

  beforeEach(() => {
    prisma = makePrisma()
    service = new TracksService(prisma as never)
  })

  describe("listTracks", () => {
    it("visitante anônimo: enrolled sempre false e sem consulta de matrícula", async () => {
      prisma.track.findMany.mockResolvedValue([
        { ...dbTrack, _count: { lessons: 2 } },
      ])

      const result = await service.listTracks("")

      expect(result).toEqual([
        {
          slug: "front-end",
          title: "Fundamentos de Front-end",
          description: "HTML e CSS do zero.",
          lessonCount: 2,
          enrolled: false,
        },
      ])
      expect(prisma.enrollment.findMany).not.toHaveBeenCalled()
    })

    it("usuário logado: marca enrolled nas trilhas matriculadas", async () => {
      prisma.track.findMany.mockResolvedValue([
        { ...dbTrack, _count: { lessons: 2 } },
        { ...dbTrack, id: 2n, slug: "back-end", _count: { lessons: 0 } },
      ])
      prisma.enrollment.findMany.mockResolvedValue([{ trackId: 1n }])

      const result = await service.listTracks("user-1")

      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { user: { code: "user-1" } },
        select: { trackId: true },
      })
      expect(result.map((track) => track.enrolled)).toEqual([true, false])
    })

    it("description null vira string vazia (default proto3)", async () => {
      prisma.track.findMany.mockResolvedValue([
        { ...dbTrack, description: null, _count: { lessons: 0 } },
      ])
      const result = await service.listTracks("")
      expect(result[0]?.description).toBe("")
    })
  })

  describe("getTrack", () => {
    it("rejeita slug inexistente com TRACK_NOT_FOUND", async () => {
      prisma.track.findUnique.mockResolvedValue(null)
      await expect(service.getTrack("ghost", "")).rejects.toThrow(
        "TRACK_NOT_FOUND",
      )
    })

    it("mapeia lições e marca completed a partir do LessonProgress", async () => {
      prisma.track.findUnique.mockResolvedValue({
        ...dbTrack,
        lessons: dbLessons,
      })
      prisma.enrollment.findMany.mockResolvedValue([{ trackId: 1n }])
      prisma.lessonProgress.findMany.mockResolvedValue([{ lessonId: 10n }])

      const result = await service.getTrack("front-end", "user-1")

      expect(result.enrolled).toBe(true)
      expect(result.lessons).toEqual([
        { slug: "intro-html", title: "HTML", position: 1, completed: true },
        { slug: "intro-css", title: "CSS", position: 2, completed: false },
      ])
      expect(prisma.lessonProgress.findMany).toHaveBeenCalledWith({
        where: {
          user: { code: "user-1" },
          lessonId: { in: [10n, 11n] },
          completedAt: { not: null },
        },
        select: { lessonId: true },
      })
    })

    it("anônimo: não consulta matrícula nem progresso", async () => {
      prisma.track.findUnique.mockResolvedValue({
        ...dbTrack,
        lessons: dbLessons,
      })

      const result = await service.getTrack("front-end", "")

      expect(result.enrolled).toBe(false)
      expect(result.lessons.every((lesson) => !lesson.completed)).toBe(true)
      expect(prisma.enrollment.findMany).not.toHaveBeenCalled()
      expect(prisma.lessonProgress.findMany).not.toHaveBeenCalled()
    })
  })
})
