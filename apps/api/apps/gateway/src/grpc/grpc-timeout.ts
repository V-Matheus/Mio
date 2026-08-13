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
    const val = Number.parseInt(process.env[serviceEnvVar] as string, 10)
    if (!Number.isNaN(val) && val > 0) return val
  }
  const isCoreService =
    serviceEnvVar &&
    (serviceEnvVar.includes("AUTH") ||
      serviceEnvVar.includes("CATALOG") ||
      serviceEnvVar.includes("PROGRESS") ||
      serviceEnvVar.includes("CORE"))
  if (isCoreService && process.env.CORE_GRPC_TIMEOUT_MS) {
    const val = Number.parseInt(process.env.CORE_GRPC_TIMEOUT_MS, 10)
    if (!Number.isNaN(val) && val > 0) return val
  }
  if (process.env.GATEWAY_GRPC_TIMEOUT_MS) {
    const val = Number.parseInt(process.env.GATEWAY_GRPC_TIMEOUT_MS, 10)
    if (!Number.isNaN(val) && val > 0) return val
  }
  if (process.env.GRPC_TIMEOUT_MS) {
    const val = Number.parseInt(process.env.GRPC_TIMEOUT_MS, 10)
    if (!Number.isNaN(val) && val > 0) return val
  }
  return defaultTimeoutMs
}
