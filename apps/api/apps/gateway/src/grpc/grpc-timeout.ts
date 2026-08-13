/**
 * Valida se uma string é estritamente um número inteiro positivo seguro.
 * Rejeita prefixos numéricos (ex: "1e3", "5000ms", "5.5"), números negativos, zero e NaN.
 */
export function parsePositiveInteger(
  val: string | undefined,
): number | undefined {
  if (!val || typeof val !== "string") return undefined
  const trimmed = val.trim()
  if (!/^\d+$/.test(trimmed)) return undefined
  const num = Number(trimmed)
  if (Number.isSafeInteger(num) && num > 0) {
    return num
  }
  return undefined
}

/**
 * Obtém o tempo limite em milissegundos configurado para requisições gRPC no Gateway.
 * Permite customização por serviço específico (ex: GAMIFICATION_GRPC_TIMEOUT_MS, CORE_GRPC_TIMEOUT_MS, AUTH_GRPC_TIMEOUT_MS)
 * ou global (GATEWAY_GRPC_TIMEOUT_MS / GRPC_TIMEOUT_MS).
 * Valor padrão: 5000ms.
 */
export function getGrpcTimeoutMs(
  serviceEnvVar?: string,
  defaultTimeoutMs = 5000,
): number {
  if (serviceEnvVar && process.env[serviceEnvVar]) {
    const val = parsePositiveInteger(process.env[serviceEnvVar])
    if (val !== undefined) return val
  }
  const isCoreService =
    serviceEnvVar &&
    (serviceEnvVar.includes("AUTH") ||
      serviceEnvVar.includes("CATALOG") ||
      serviceEnvVar.includes("PROGRESS") ||
      serviceEnvVar.includes("CORE"))
  if (isCoreService && process.env.CORE_GRPC_TIMEOUT_MS) {
    const val = parsePositiveInteger(process.env.CORE_GRPC_TIMEOUT_MS)
    if (val !== undefined) return val
  }
  if (process.env.GATEWAY_GRPC_TIMEOUT_MS) {
    const val = parsePositiveInteger(process.env.GATEWAY_GRPC_TIMEOUT_MS)
    if (val !== undefined) return val
  }
  if (process.env.GRPC_TIMEOUT_MS) {
    const val = parsePositiveInteger(process.env.GRPC_TIMEOUT_MS)
    if (val !== undefined) return val
  }
  return defaultTimeoutMs
}
