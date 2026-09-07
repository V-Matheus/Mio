import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { firstValueFrom, type Observable, timeout } from "rxjs"
import { CORE_PACKAGE_TOKEN } from "./core-client.registry"

export interface StudentProfileProgressResponse {
  totalCompletedLessons: number
}

export interface ProgressServiceClient {
  getStudentProfileProgress(data: {
    userCode: string
  }): Observable<StudentProfileProgressResponse>
}

function parsePositiveInteger(val: string | undefined): number | undefined {
  if (!val || typeof val !== "string") return undefined
  const trimmed = val.trim()
  if (!/^\d+$/.test(trimmed)) return undefined
  const num = Number(trimmed)
  if (Number.isSafeInteger(num) && num > 0) {
    return num
  }
  return undefined
}

export function getCoreGrpcTimeoutMs(): number {
  const envVal = process.env.CORE_GRPC_TIMEOUT_MS || process.env.GRPC_TIMEOUT_MS
  const parsed = parsePositiveInteger(envVal)
  if (parsed !== undefined) {
    return parsed
  }
  return 3000
}

@Injectable()
export class CoreClientService implements OnModuleInit {
  private progressService!: ProgressServiceClient
  private readonly timeoutMs: number

  constructor(@Inject(CORE_PACKAGE_TOKEN) private readonly client: ClientGrpc) {
    this.timeoutMs = getCoreGrpcTimeoutMs()
  }

  onModuleInit(): void {
    this.progressService =
      this.client.getService<ProgressServiceClient>("ProgressService")
  }

  /**
   * Retorna o total de lições concluídas pelo usuário (fonte da verdade: Core
   * / `LessonProgress`). Falhas de rede/timeout resolvem para 0 — mesma
   * política de degradação graciosa usada pelo `GamificationClientService`.
   */
  async getTotalCompletedLessons(userCode: string): Promise<number> {
    if (!userCode) return 0
    try {
      const res = await firstValueFrom(
        this.progressService
          .getStudentProfileProgress({ userCode })
          .pipe(timeout(this.timeoutMs)),
      )
      return res?.totalCompletedLessons ?? 0
    } catch {
      return 0
    }
  }
}
