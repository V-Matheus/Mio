import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { firstValueFrom, type Observable, timeout } from "rxjs"
import { GAMIFICATION_PACKAGE_TOKEN } from "./gamification-client.registry"

export interface UserXpResponse {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
}

export interface StreakInfoResponse {
  streakCurrent: number
  streakBest: number
  lastStudyDate: string
}

export interface GamificationProfileResponse {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
  streak: StreakInfoResponse
}

export interface GamificationServiceClient {
  getUserXp(data: { userCode: string }): Observable<UserXpResponse>
  getUserGamificationProfile(data: {
    userCode: string
  }): Observable<GamificationProfileResponse>
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

export function getGamificationGrpcTimeoutMs(): number {
  const envVal =
    process.env.GAMIFICATION_GRPC_TIMEOUT_MS || process.env.GRPC_TIMEOUT_MS
  const parsed = parsePositiveInteger(envVal)
  if (parsed !== undefined) {
    return parsed
  }
  return 3000
}

@Injectable()
export class GamificationClientService implements OnModuleInit {
  private gamificationService!: GamificationServiceClient
  private readonly timeoutMs: number

  constructor(
    @Inject(GAMIFICATION_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {
    this.timeoutMs = getGamificationGrpcTimeoutMs()
  }

  onModuleInit(): void {
    this.gamificationService =
      this.client.getService<GamificationServiceClient>("GamificationService")
  }

  /**
   * Retorna o XP total do usuário; falhas de rede/timeout resolvem para 0 para
   * não travar a leitura de conquistas por indisponibilidade da Gamification.
   */
  async getTotalXp(userCode: string): Promise<number> {
    if (!userCode) return 0
    try {
      const res = await firstValueFrom(
        this.gamificationService
          .getUserXp({ userCode })
          .pipe(timeout(this.timeoutMs)),
      )
      return res?.total ?? 0
    } catch {
      return 0
    }
  }

  /**
   * Retorna a sequência atual de dias consecutivos de estudo do usuário;
   * falhas de rede/timeout resolvem para 0 pelo mesmo motivo de `getTotalXp`.
   */
  async getStreakCurrent(userCode: string): Promise<number> {
    if (!userCode) return 0
    try {
      const res = await firstValueFrom(
        this.gamificationService
          .getUserGamificationProfile({ userCode })
          .pipe(timeout(this.timeoutMs)),
      )
      return res?.streak?.streakCurrent ?? 0
    } catch {
      return 0
    }
  }
}
