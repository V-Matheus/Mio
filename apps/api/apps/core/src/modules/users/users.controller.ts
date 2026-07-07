import { usersContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import type { UserResponse } from "./users.service"
import { UsersService } from "./users.service"

const USERS_SERVICE = usersContract.service

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @GrpcMethod(USERS_SERVICE, "Register")
  register(data: {
    email: string
    name: string
    password: string
  }): Promise<UserResponse> {
    return this.users.register(data)
  }

  @GrpcMethod(USERS_SERVICE, "ValidateCredentials")
  validateCredentials(data: {
    email: string
    password: string
  }): Promise<UserResponse> {
    return this.users.validateCredentials(data.email, data.password)
  }

  @GrpcMethod(USERS_SERVICE, "FindByEmail")
  findByEmail(data: { email: string }): Promise<UserResponse> {
    return this.users.findByEmail(data.email)
  }

  @GrpcMethod(USERS_SERVICE, "FindByCode")
  findByCode(data: { code: string }): Promise<UserResponse> {
    return this.users.findByCode(data.code)
  }

  @GrpcMethod(USERS_SERVICE, "UpsertOAuthUser")
  upsertOAuthUser(data: {
    provider: string
    providerAccountId: string
    email: string
    name: string
    avatarUrl: string
  }): Promise<UserResponse> {
    return this.users.upsertOAuthUser(data)
  }

  @GrpcMethod(USERS_SERVICE, "IssuePasswordReset")
  issuePasswordReset(data: {
    email: string
  }): Promise<{ token: string; expiresAt: string }> {
    return this.users.issuePasswordReset(data.email)
  }

  @GrpcMethod(USERS_SERVICE, "ConsumePasswordReset")
  consumePasswordReset(data: {
    token: string
    newPassword: string
  }): Promise<UserResponse> {
    return this.users.consumePasswordReset(data.token, data.newPassword)
  }

  @GrpcMethod(USERS_SERVICE, "UpdateUserRole")
  updateUserRole(data: {
    code: string
    role: string
  }): Promise<UserResponse> {
    return this.users.updateUserRole(data.code, data.role)
  }
}
