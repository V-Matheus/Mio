import { describe, expect, it } from "vitest"
import { calculateNextStreak, getEffectiveStreak } from "./streak"

describe("streak calculation logic", () => {
  describe("calculateNextStreak", () => {
    it("inicia streak com 1 quando não há registro anterior", () => {
      const now = new Date("2026-08-17T10:00:00.000Z")
      const result = calculateNextStreak(null, now)

      expect(result.streakCurrent).toBe(1)
      expect(result.streakBest).toBe(1)
      expect(result.lastStudyDate).toEqual(now)
    })

    it("mantém streakCurrent se já estudou hoje", () => {
      const todayMorning = new Date("2026-08-17T08:00:00.000Z")
      const todayAfternoon = new Date("2026-08-17T14:00:00.000Z")

      const initial = {
        streakCurrent: 5,
        streakBest: 10,
        lastStudyDate: todayMorning,
      }

      const result = calculateNextStreak(initial, todayAfternoon)

      expect(result.streakCurrent).toBe(5)
      expect(result.streakBest).toBe(10)
      expect(result.lastStudyDate).toEqual(todayAfternoon)
    })

    it("incrementa streakCurrent se o último estudo foi ontem", () => {
      const yesterday = new Date("2026-08-16T20:00:00.000Z")
      const today = new Date("2026-08-17T10:00:00.000Z")

      const initial = {
        streakCurrent: 3,
        streakBest: 3,
        lastStudyDate: yesterday,
      }

      const result = calculateNextStreak(initial, today)

      expect(result.streakCurrent).toBe(4)
      expect(result.streakBest).toBe(4)
      expect(result.lastStudyDate).toEqual(today)
    })

    it("reinicia streak em 1 se passou mais de 1 dia, preservando streakBest", () => {
      const threeDaysAgo = new Date("2026-08-14T10:00:00.000Z")
      const today = new Date("2026-08-17T10:00:00.000Z")

      const initial = {
        streakCurrent: 12,
        streakBest: 20,
        lastStudyDate: threeDaysAgo,
      }

      const result = calculateNextStreak(initial, today)

      expect(result.streakCurrent).toBe(1)
      expect(result.streakBest).toBe(20)
      expect(result.lastStudyDate).toEqual(today)
    })
  })

  describe("getEffectiveStreak", () => {
    it("retorna 0 para usuário sem histórico", () => {
      const res = getEffectiveStreak(null)
      expect(res.streakCurrent).toBe(0)
      expect(res.streakBest).toBe(0)
      expect(res.lastStudyDate).toBeNull()
    })

    it("retorna streakCurrent se estudou hoje ou ontem", () => {
      const now = new Date("2026-08-17T10:00:00.000Z")
      const todayStudy = new Date("2026-08-17T08:00:00.000Z")
      const yesterdayStudy = new Date("2026-08-16T18:00:00.000Z")

      expect(
        getEffectiveStreak(
          { streakCurrent: 7, streakBest: 15, lastStudyDate: todayStudy },
          now,
        ).streakCurrent,
      ).toBe(7)

      expect(
        getEffectiveStreak(
          { streakCurrent: 7, streakBest: 15, lastStudyDate: yesterdayStudy },
          now,
        ).streakCurrent,
      ).toBe(7)
    })

    it("retorna 0 se o último estudo foi antes de ontem (quebrou a sequência)", () => {
      const now = new Date("2026-08-17T10:00:00.000Z")
      const oldStudy = new Date("2026-08-15T18:00:00.000Z")

      const res = getEffectiveStreak(
        { streakCurrent: 10, streakBest: 25, lastStudyDate: oldStudy },
        now,
      )

      expect(res.streakCurrent).toBe(0)
      expect(res.streakBest).toBe(25)
      expect(res.lastStudyDate).toBe(oldStudy.toISOString())
    })
  })
})
