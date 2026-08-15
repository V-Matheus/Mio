/**
 * Converte strings de TTL (ex: "1d", "7d", "1h", "30m", "60s", "3600") para segundos inteiros.
 */
export function parseTtlSeconds(
  ttlStr: string | undefined,
  defaultSeconds = 86400,
): number {
  if (!ttlStr) return defaultSeconds
  const match = ttlStr.match(/^(\d+)([smhd])?$/)
  if (!match || !match[1]) return defaultSeconds
  const val = Number.parseInt(match[1], 10)
  const unit = match[2]
  switch (unit) {
    case "s":
      return val
    case "m":
      return val * 60
    case "h":
      return val * 3600
    case "d":
      return val * 86400
    default:
      return val
  }
}
