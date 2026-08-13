import { z } from "zod"

/**
 * Validação dos argumentos de paginação para o leaderboard.
 * - limit: número inteiro entre 1 e 100 (respeitando a política máxima do gRPC).
 * - offset: número inteiro maior ou igual a 0.
 */
export const leaderboardLimitSchema = z
  .number({ message: "O limite deve ser um número" })
  .int("O limite deve ser um número inteiro")
  .min(1, "O limite deve ser no mínimo 1")
  .max(100, "O limite máximo permitido é 100")

export const leaderboardOffsetSchema = z
  .number({ message: "O offset deve ser um número" })
  .int("O offset deve ser um número inteiro")
  .min(0, "O offset não pode ser negativo")
