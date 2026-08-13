import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { firstValueFrom, type Observable, timeout } from "rxjs"
import { USERS_PACKAGE_TOKEN } from "./core-client.registry"

export interface UserResponseDto {
  code: string
  email: string
  name: string
  avatarUrl: string
  roles: string[]
}

export interface UsersServiceClient {
  batchGetUsers(data: {
    codes: string[]
  }): Observable<{ users: UserResponseDto[] }>
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
  private usersService!: UsersServiceClient
  private readonly timeoutMs: number

  constructor(
    @Inject(USERS_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {
    this.timeoutMs = getCoreGrpcTimeoutMs()
  }

  onModuleInit(): void {
    this.usersService =
      this.client.getService<UsersServiceClient>("UsersService")
  }

  async batchGetUsers(codes: string[]): Promise<UserResponseDto[]> {
    if (!codes || codes.length === 0) {
      return []
    }
    try {
      const res = await firstValueFrom(
        this.usersService
          .batchGetUsers({ codes })
          .pipe(timeout(this.timeoutMs)),
      )
      return res?.users ?? []
    } catch {
      return []
    }
  }
}
