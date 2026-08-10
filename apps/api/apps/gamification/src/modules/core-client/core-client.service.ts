import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import type { ClientGrpc } from "@nestjs/microservices"
import { firstValueFrom, type Observable } from "rxjs"
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

@Injectable()
export class CoreClientService implements OnModuleInit {
  private usersService!: UsersServiceClient

  constructor(
    @Inject(USERS_PACKAGE_TOKEN) private readonly client: ClientGrpc,
  ) {}

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
        this.usersService.batchGetUsers({ codes }),
      )
      return res?.users ?? []
    } catch {
      return []
    }
  }
}
