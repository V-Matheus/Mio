import { GraphQLError } from "graphql"
import { firstValueFrom, type Observable, TimeoutError, timeout } from "rxjs"
import { getGrpcTimeoutMs } from "./grpc-timeout"

export interface GrpcCallerOptions {
  /** Nome da variável de ambiente para timeout específico deste serviço (ex: GAMIFICATION_GRPC_TIMEOUT_MS) */
  serviceEnvVar?: string
  /** Tempo limite em ms (se não especificado, utiliza getGrpcTimeoutMs) */
  timeoutMs?: number
  /** Dicionário de tradução de códigos gRPC (details) para mensagens amigáveis */
  errorMap?: Record<string, string>
  /** Mensagem padrão de erro caso o código gRPC não esteja no errorMap */
  defaultErrorMessage?: string
  /** Código de extensão GraphQL para erro de timeout (padrão: "UNAVAILABLE") */
  timeoutCode?: string
  /** Mensagem amigável para erro de timeout */
  timeoutMessage?: string
  /** Código padrão para erros não mapeados (padrão: "INTERNAL_ERROR") */
  defaultErrorCode?: string
}

/**
 * Utilitário centralizado para execução de chamadas gRPC via RxJS com:
 * - Aplicação de timeout configurável por serviço/globalmente via env.
 * - Tratamento padronizado de TimeoutError com mensagem amigável e código GraphQL.
 * - Mapeamento automático de erros gRPC com suporte a códigos e mensagens customizados.
 * - Suporte a chamadas nullable para entidades que retornam null em caso de not-found.
 */
export class GrpcCaller {
  readonly timeoutMs: number
  private readonly options: GrpcCallerOptions

  constructor(options: GrpcCallerOptions = {}) {
    this.options = options
    this.timeoutMs =
      options.timeoutMs ?? getGrpcTimeoutMs(options.serviceEnvVar, 5000)
  }

  async call<T>(source: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(source.pipe(timeout(this.timeoutMs)))
    } catch (error) {
      throw this.mapError(error)
    }
  }

  async callNullable<T, R>(
    source: Observable<T>,
    mapFn: (response: T) => R,
    notFoundCodes?: Set<string> | string[],
  ): Promise<R | null> {
    try {
      const response = await this.call(source)
      return mapFn(response)
    } catch (error) {
      if (error instanceof GraphQLError) {
        const code = error.extensions?.code as string | undefined
        if (code && notFoundCodes) {
          const isNotFound =
            notFoundCodes instanceof Set
              ? notFoundCodes.has(code)
              : notFoundCodes.includes(code)
          if (isNotFound) {
            return null
          }
        }
      }
      throw error
    }
  }

  mapError(error: unknown): GraphQLError {
    if (
      error instanceof TimeoutError ||
      (error as Error)?.name === "TimeoutError"
    ) {
      const code = this.options.timeoutCode ?? "UNAVAILABLE"
      const message =
        this.options.timeoutMessage ??
        "Serviço temporariamente indisponível (tempo limite excedido)"
      return new GraphQLError(message, {
        extensions: { code },
      })
    }

    const details = (error as { details?: string })?.details
    const errorMap = this.options.errorMap ?? {}
    const hasMappedDetail = Boolean(details && details in errorMap)
    const code = hasMappedDetail
      ? (details as string)
      : (this.options.defaultErrorCode ?? "INTERNAL_ERROR")
    const message =
      (details && errorMap[details]) ??
      this.options.defaultErrorMessage ??
      details ??
      (error instanceof Error ? error.message : "Erro interno")

    return new GraphQLError(message, {
      extensions: { code, ...(details ? { details } : {}) },
    })
  }
}
