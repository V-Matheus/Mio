import { z } from "zod"

/** Slugs de rota do catálogo: minúsculas, números e hífens (ex.: "intro-html"). */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug inválido")
