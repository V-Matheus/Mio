import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import type { ClientGrpc } from "@nestjs/microservices"
import { GrpcCaller } from "../../grpc/grpc-caller"
import { USERS_PACKAGE_TOKEN } from "../../grpc/registry"
import type { LoginInput } from "./dto/login.input"
import type { RegisterInput } from "./dto/register.input"
import type { UpsertOAuthInput } from "./dto/upsert-oauth.input"
import type { AuthPayload } from "./models/auth-payload.model"
import type { User } from "./models/user.model"
import type {
  GrpcUserResponse,
  UsersServiceClient,
} from "./repositories/users.repository"

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Credenciais inválidas",
  EMAIL_IN_USE: "Email já cadastrado",
  PASSWORD_RESET_EXPIRED: "Token de redefinição inválido ou expirado",
  USER_NOT_FOUND: "Usuário não encontrado",
  INVALID_PROVIDER: "Provedor OAuth inválido",
}

@Injectable()
export class AuthService implements OnModuleInit {
  private usersService!: UsersServiceClient
  private readonly caller = new GrpcCaller({
    serviceEnvVar: "AUTH_GRPC_TIMEOUT_MS",
    errorMap: ERROR_MESSAGES,
    defaultErrorMessage: "Erro interno",
    timeoutCode: "UNAVAILABLE",
    timeoutMessage:
      "Serviço de autenticação indisponível (tempo limite excedido)",
  })

  constructor(
    @Inject(USERS_PACKAGE_TOKEN) private readonly client: ClientGrpc,
    private readonly jwt: JwtService,
  ) {}

  onModuleInit(): void {
    this.usersService =
      this.client.getService<UsersServiceClient>("UsersService")
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    const user = await this.caller.call(this.usersService.register(input))
    return this.toAuthPayload(user)
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.caller.call(
      this.usersService.validateCredentials(input),
    )
    return this.toAuthPayload(user)
  }

  async upsertOAuthUser(input: UpsertOAuthInput): Promise<AuthPayload> {
    const user = await this.caller.call(
      this.usersService.upsertOAuthUser({
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl ?? "",
      }),
    )
    return this.toAuthPayload(user)
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    await this.caller.call(this.usersService.issuePasswordReset({ email }))
    return true
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    await this.caller.call(
      this.usersService.consumePasswordReset({ token, newPassword }),
    )
    return true
  }

  async me(userCode: string): Promise<User> {
    const user = await this.caller.call(
      this.usersService.findByCode({ code: userCode }),
    )
    return toUser(user)
  }

  async listUsers(search?: string): Promise<User[]> {
    const { users } = await this.caller.call(
      this.usersService.listUsers({ search: search ?? "" }),
    )
    return users.map(toUser)
  }

  async updateUserRole(code: string, role: string): Promise<User> {
    const user = await this.caller.call(
      this.usersService.updateUserRole({ code, role }),
    )
    return toUser(user)
  }

  private toAuthPayload(user: GrpcUserResponse): AuthPayload {
    return {
      accessToken: this.jwt.sign({
        sub: user.code,
        roles: user.roles || [],
      }),
      user: toUser(user),
    }
  }
}

function toUser(user: GrpcUserResponse): User {
  return {
    code: user.code,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl || null,
    roles: user.roles || [],
  }
}
