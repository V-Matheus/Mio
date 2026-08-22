/**
 * Formata um valor numérico com separador de milhar.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

/**
 * Formata uma data ISO para string relativa amigável em português.
 */
export function formatRelativeTime(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return ""

    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return "Agora mesmo"
    if (diffInHours < 24) return `Há ${diffInHours}h`
    if (diffInDays === 1) return "Ontem"
    if (diffInDays < 7) return `Há ${diffInDays} dias`

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })
  } catch {
    return ""
  }
}
