import { describe, expect, it } from "vitest"
import { levelFor } from "./level"

describe("levelFor", () => {
  it("0 XP -> LEIGO (0% para Iniciante, 100 XP restantes)", () => {
    const res = levelFor(0)
    expect(res.level).toBe("LEIGO")
    expect(res.progressToNext).toBe(0)
    expect(res.xpToNextLevel).toBe(100)
  })

  it("50 XP -> LEIGO (50% para Iniciante, 50 XP restantes)", () => {
    const res = levelFor(50)
    expect(res.level).toBe("LEIGO")
    expect(res.progressToNext).toBe(50)
    expect(res.xpToNextLevel).toBe(50)
  })

  it("100 XP -> INICIANTE (0% para Júnior, 400 XP restantes)", () => {
    const res = levelFor(100)
    expect(res.level).toBe("INICIANTE")
    expect(res.progressToNext).toBe(0)
    expect(res.xpToNextLevel).toBe(400)
  })

  it("300 XP -> INICIANTE (50% para Júnior, 200 XP restantes)", () => {
    const res = levelFor(300)
    expect(res.level).toBe("INICIANTE")
    expect(res.progressToNext).toBe(50)
    expect(res.xpToNextLevel).toBe(200)
  })

  it("500 XP -> JUNIOR (0% para Pleno, 1000 XP restantes)", () => {
    const res = levelFor(500)
    expect(res.level).toBe("JUNIOR")
    expect(res.progressToNext).toBe(0)
    expect(res.xpToNextLevel).toBe(1000)
  })

  it("1500 XP -> PLENO", () => {
    const res = levelFor(1500)
    expect(res.level).toBe("PLENO")
    expect(res.progressToNext).toBe(0)
    expect(res.xpToNextLevel).toBe(2500)
  })

  it("4000 XP -> SENIOR", () => {
    const res = levelFor(4000)
    expect(res.level).toBe("SENIOR")
    expect(res.progressToNext).toBe(0)
    expect(res.xpToNextLevel).toBe(6000)
  })

  it("10000 XP ou mais -> ESPECIALISTA (100% progresso, 0 XP restante)", () => {
    const res = levelFor(10000)
    expect(res.level).toBe("ESPECIALISTA")
    expect(res.progressToNext).toBe(100)
    expect(res.xpToNextLevel).toBe(0)

    const res2 = levelFor(50000)
    expect(res2.level).toBe("ESPECIALISTA")
    expect(res2.progressToNext).toBe(100)
    expect(res2.xpToNextLevel).toBe(0)
  })

  it("trata valores negativos graciosamente", () => {
    const res = levelFor(-10)
    expect(res.level).toBe("LEIGO")
    expect(res.progressToNext).toBe(0)
    expect(res.xpToNextLevel).toBe(100)
  })
})
