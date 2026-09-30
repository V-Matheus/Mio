/**
 * Calcula o score composto para o Sorted Set do Redis.
 * A parte inteira é o XP total acumulado (critério primário).
 * A parte fracionária é o desempate por tempo (quem alcançou a pontuação primeiro tem maior fração).
 * Timestamp de 13 dígitos normalizado para 0 < fração < 1.
 */
export function calculateCompositeScore(
  totalXp: number,
  timestamp = Date.now(),
): number {
  if (totalXp <= 0) return 0
  const fraction = Math.max(
    0,
    Math.min(0.99999999, 1 - timestamp / 10_000_000_000_000),
  )
  return totalXp + fraction
}

/** Extrai o valor inteiro de XP a partir do score composto do Redis. */
export function extractXpFromScore(score: number): number {
  return Math.floor(score)
}
