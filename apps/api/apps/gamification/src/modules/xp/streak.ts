import { getDiffInDaysUtc } from "../../utils/date.utils"

export interface StreakState {
  streakCurrent: number
  streakBest: number
  lastStudyDate: Date | null
}

export interface EffectiveStreak {
  streakCurrent: number
  streakBest: number
  lastStudyDate: string | null
}

/**
 * Calcula o novo estado de streak após a conclusão de uma atividade.
 */
export function calculateNextStreak(
  current: StreakState | null,
  now: Date = new Date(),
): StreakState {
  if (!current?.lastStudyDate) {
    return {
      streakCurrent: 1,
      streakBest: Math.max(current?.streakBest ?? 0, 1),
      lastStudyDate: now,
    }
  }

  const diffDays = getDiffInDaysUtc(now, current.lastStudyDate)

  // Evento obsoleto / no passado em relação ao último estudo registrado:
  // streakCurrent, streakBest e lastStudyDate permanecem inalterados
  if (diffDays < 0) {
    return {
      streakCurrent: current.streakCurrent,
      streakBest: current.streakBest,
      lastStudyDate: current.lastStudyDate,
    }
  }

  // Mesmo dia: não incrementa, mantém o valor atual
  if (diffDays === 0) {
    return {
      streakCurrent: current.streakCurrent,
      streakBest: Math.max(current.streakBest, current.streakCurrent),
      lastStudyDate: now,
    }
  }

  // Dia imediatamente consecutivo (ontem): incrementa streak
  if (diffDays === 1) {
    const nextCurrent = current.streakCurrent + 1
    return {
      streakCurrent: nextCurrent,
      streakBest: Math.max(current.streakBest, nextCurrent),
      lastStudyDate: now,
    }
  }

  // Mais de 1 dia de intervalo: sequência foi quebrada, reinicia em 1
  return {
    streakCurrent: 1,
    streakBest: Math.max(current.streakBest, 1),
    lastStudyDate: now,
  }
}

/**
 * Obtém o streak efetivo para exibição. Se o usuário não estudou nem hoje nem ontem,
 * a sequência ativa expirou e retorna streakCurrent = 0 (sem perder o streakBest).
 */
export function getEffectiveStreak(
  streak: StreakState | null,
  now: Date = new Date(),
): EffectiveStreak {
  if (!streak?.lastStudyDate) {
    return {
      streakCurrent: 0,
      streakBest: streak?.streakBest ?? 0,
      lastStudyDate: null,
    }
  }

  const diffDays = getDiffInDaysUtc(now, streak.lastStudyDate)

  // Se estudou hoje (0) ou ontem (1), o streak está ativo
  if (diffDays >= 0 && diffDays <= 1) {
    return {
      streakCurrent: streak.streakCurrent,
      streakBest: streak.streakBest,
      lastStudyDate: streak.lastStudyDate.toISOString(),
    }
  }

  // Quebrou a sequência
  return {
    streakCurrent: 0,
    streakBest: streak.streakBest,
    lastStudyDate: streak.lastStudyDate.toISOString(),
  }
}
