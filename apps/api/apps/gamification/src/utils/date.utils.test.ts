import { describe, expect, it } from "vitest"
import { getDiffInDaysUtc, toUtcDateString } from "./date.utils"

describe("date.utils", () => {
  it("converte datas para string YYYY-MM-DD em UTC corretamente", () => {
    const d = new Date("2026-08-17T15:30:00.000Z")
    expect(toUtcDateString(d)).toBe("2026-08-17")
  })

  it("calcula diferença de dias em UTC", () => {
    const d1 = new Date("2026-08-17T12:00:00.000Z")
    const d2 = new Date("2026-08-16T22:00:00.000Z")
    const d3 = new Date("2026-08-15T02:00:00.000Z")

    expect(getDiffInDaysUtc(d1, d2)).toBe(1)
    expect(getDiffInDaysUtc(d1, d3)).toBe(2)
    expect(getDiffInDaysUtc(d1, d1)).toBe(0)
  })
})
