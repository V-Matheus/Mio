import { z } from "zod"

/**
 * Validação dos argumentos de paginação das queries de conquistas.
 * - limit: número inteiro entre 1 e 50.
 * - offset: número inteiro maior ou igual a 0.
 */
export const achievementsLimitSchema = z
  .number({ message: "O limite deve ser um número" })
  .int("O limite deve ser um número inteiro")
  .min(1, "O limite deve ser no mínimo 1")
  .max(50, "O limite máximo permitido é 50")

export const achievementsOffsetSchema = z
  .number({ message: "O offset deve ser um número" })
  .int("O offset deve ser um número inteiro")
  .min(0, "O offset não pode ser negativo")
