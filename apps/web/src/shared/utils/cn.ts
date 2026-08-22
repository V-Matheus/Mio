/**
 * Utilitário para combinação e filtragem de classes CSS.
 * Concatena strings de classe e remove valores falsos/nulos.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}
