/**
 * Converte uma data para string YYYY-MM-DD em UTC.
 */
export function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Calcula a diferença em dias civis (UTC) entre duas datas.
 * Retorna (dateA - dateB) em dias inteiros.
 */
export function getDiffInDaysUtc(dateA: Date, dateB: Date): number {
  const utcDateA = Date.UTC(
    dateA.getUTCFullYear(),
    dateA.getUTCMonth(),
    dateA.getUTCDate(),
  )
  const utcDateB = Date.UTC(
    dateB.getUTCFullYear(),
    dateB.getUTCMonth(),
    dateB.getUTCDate(),
  )
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  return Math.floor((utcDateA - utcDateB) / MS_PER_DAY)
}
