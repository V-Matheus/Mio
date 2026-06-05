import { AuthProvider, type User } from ".prisma/core"
import { createHash, randomBytes } from "node:crypto"
import { Injectable } from "@nestjs/common"
import { hash, verify } from "@node-rs/argon2"
import { nanoid } from "nanoid"
import { PrismaService } from "../prisma/prisma.service"
import { userError } from "./errors/users.errors"
import { UserEventsPublisher } from "./events/user-events.publisher"

const USER_CODE_SIZE = 12
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000 // 1h

export type UserResponse = {
  code: string
  email: string
  name: string
  avatarUrl: string
}

export type RegisterInput = {
  email: string
  name: string
  password: string
}

export type UpsertOAuthInput = {
  provider: string
  providerAccountId: string
  email: string
  name: string
  avatarUrl: string
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: UserEventsPublisher,
  ) {}

  async register({
    email,
    name,
    password,
  }: RegisterInput): Promise<UserResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw userError("EMAIL_IN_USE")
    }

    const user = await this.prisma.user.create({
      data: {
        code: nanoid(USER_CODE_SIZE),
        email,
        name,
        passwordHash: await hash(password),
        identities: {
          create: {
            provider: AuthProvider.CREDENTIALS,
            providerAccountId: email,
          },
        },
      },
    })

    await this.events.userRegistered({
      userCode: user.code,
      email: user.email,
      name: user.name,
      registeredAt: user.createdAt.toISOString(),
    })

    return toUserResponse(user)
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user?.passwordHash || !(await verify(user.passwordHash, password))) {
      throw userError("INVALID_CREDENTIALS")
    }
    return toUserResponse(user)
  }

  async findByEmail(email: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw userError("USER_NOT_FOUND")
    }
    return toUserResponse(user)
  }

  async findByCode(code: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { code } })
    if (!user) {
      throw userError("USER_NOT_FOUND")
    }
    return toUserResponse(user)
  }

  async upsertOAuthUser(input: UpsertOAuthInput): Promise<UserResponse> {
    const provider = toAuthProvider(input.provider)

    const identity = await this.prisma.userIdentity.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: input.providerAccountId,
        },
      },
      include: { user: true },
    })
    if (identity) {
      return toUserResponse(identity.user)
    }

    // Política da spec: vincular automaticamente a um User existente de mesmo email.
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    })
    if (existing) {
      await this.prisma.userIdentity.create({
        data: {
          userId: existing.id,
          provider,
          providerAccountId: input.providerAccountId,
        },
      })
      return toUserResponse(existing)
    }

    const user = await this.prisma.user.create({
      data: {
        code: nanoid(USER_CODE_SIZE),
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl || null,
        identities: {
          create: { provider, providerAccountId: input.providerAccountId },
        },
      },
    })

    await this.events.userRegistered({
      userCode: user.code,
      email: user.email,
      name: user.name,
      registeredAt: user.createdAt.toISOString(),
    })

    return toUserResponse(user)
  }

  async issuePasswordReset(
    email: string,
  ): Promise<{ token: string; expiresAt: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    // Anti-enumeração: usuário inexistente vira no-op silencioso.
    if (!user) {
      return { token: "", expiresAt: "" }
    }

    const token = randomBytes(32).toString("base64url")
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

    await this.prisma.passwordReset.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
    })

    await this.events.userPasswordResetRequested({
      userCode: user.code,
      email: user.email,
      resetToken: token,
      expiresAt: expiresAt.toISOString(),
    })

    return { token, expiresAt: expiresAt.toISOString() }
  }

  async consumePasswordReset(
    token: string,
    newPassword: string,
  ): Promise<UserResponse> {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { tokenHash: hashToken(token) },
    })
    if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) {
      throw userError("PASSWORD_RESET_EXPIRED")
    }

    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: await hash(newPassword) },
      }),
      this.prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
    ])

    return toUserResponse(user)
  }
}

function toUserResponse(user: User): UserResponse {
  return {
    code: user.code,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? "",
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function toAuthProvider(provider: string): AuthProvider {
  switch (provider.toLowerCase()) {
    case "google":
      return AuthProvider.GOOGLE
    case "github":
      return AuthProvider.GITHUB
    default:
      throw userError("INVALID_PROVIDER")
  }
}
