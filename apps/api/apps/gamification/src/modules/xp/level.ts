export const LEVEL_THRESHOLDS = [
  { level: "LEIGO", minXp: 0 },
  { level: "INICIANTE", minXp: 100 },
  { level: "JUNIOR", minXp: 500 },
  { level: "PLENO", minXp: 1500 },
  { level: "SENIOR", minXp: 4000 },
  { level: "ESPECIALISTA", minXp: 10000 },
] as const

export type Level = (typeof LEVEL_THRESHOLDS)[number]["level"]

export type LevelProgress = {
  level: Level
  progressToNext: number // 0..100
  xpToNextLevel: number // XP restante para o próximo nível (0 se no nível máximo)
}

/**
 * Calcula o nível atual, percentual de progresso e XP restante com base no XP acumulado.
 */
export function levelFor(totalXp: number): LevelProgress {
  const xp = Math.max(0, totalXp || 0)

  let currentIdx = 0
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = LEVEL_THRESHOLDS[i]
    if (threshold && xp >= threshold.minXp) {
      currentIdx = i
      break
    }
  }

  const current = LEVEL_THRESHOLDS[currentIdx] ?? LEVEL_THRESHOLDS[0]
  const next = LEVEL_THRESHOLDS[currentIdx + 1]

  if (!next) {
    return {
      level: current.level,
      progressToNext: 100,
      xpToNextLevel: 0,
    }
  }

  const range = next.minXp - current.minXp
  const earnedInRange = xp - current.minXp
  const progressToNext = Math.min(
    100,
    Math.max(0, Math.floor((earnedInRange / range) * 100)),
  )
  const xpToNextLevel = Math.max(0, next.minXp - xp)

  return {
    level: current.level,
    progressToNext,
    xpToNextLevel,
  }
}
