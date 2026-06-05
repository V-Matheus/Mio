import { AuthProvider } from ".prisma/core"
import { RpcException } from "@nestjs/microservices"
import { hash } from "@node-rs/argon2"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { UserEventsPublisher } from "../../apps/core/src/modules/users/events/user-events.publisher"
import { UsersService } from "../../apps/core/src/modules/users/users.service"

type PrismaMock = {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  userIdentity: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
  }
  passwordReset: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  $transaction: ReturnType<typeof vi.fn>
}

function makePrisma(): PrismaMock {
  return {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    userIdentity: { findUnique: vi.fn(), create: vi.fn() },
    passwordReset: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  }
}

const baseUser = {
  id: 1n,
  code: "abc123",
  email: "victor@example.com",
  name: "Victor",
  avatarUrl: null,
  passwordHash: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
}

describe("UsersService", () => {
  let prisma: PrismaMock
  let events: {
    userRegistered: ReturnType<typeof vi.fn>
    userPasswordResetRequested: ReturnType<typeof vi.fn>
  }
  let service: UsersService

  beforeEach(() => {
    prisma = makePrisma()
    events = { userRegistered: vi.fn(), userPasswordResetRequested: vi.fn() }
    service = new UsersService(
      prisma as never,
      events as unknown as UserEventsPublisher,
    )
  })

  describe("register", () => {
    it("rejeita email já cadastrado com EMAIL_IN_USE", async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser)
      await expect(
        service.register({ email: baseUser.email, name: "X", password: "pw" }),
      ).rejects.toThrow("EMAIL_IN_USE")
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it("cria usuário, gera code, hasheia senha e publica user.registered", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue(baseUser)

      const result = await service.register({
        email: baseUser.email,
        name: baseUser.name,
        password: "s3cret",
      })

      const data = prisma.user.create.mock.calls[0]?.[0].data
      expect(data?.code).toHaveLength(12)
      expect(data?.passwordHash).toMatch(/^\$argon2id\$/)
      expect(data?.identities.create.provider).toBe(AuthProvider.CREDENTIALS)
      expect(events.userRegistered).toHaveBeenCalledWith(
        expect.objectContaining({
          userCode: baseUser.code,
          email: baseUser.email,
        }),
      )
      expect(result).toEqual({
        code: baseUser.code,
        email: baseUser.email,
        name: baseUser.name,
        avatarUrl: "",
      })
    })
  })

  describe("validateCredentials", () => {
    it("aceita senha correta", async () => {
      const passwordHash = await hash("correct-horse")
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash })
      const result = await service.validateCredentials(
        baseUser.email,
        "correct-horse",
      )
      expect(result.code).toBe(baseUser.code)
    })

    it("rejeita senha errada com INVALID_CREDENTIALS", async () => {
      const passwordHash = await hash("correct-horse")
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash })
      await expect(
        service.validateCredentials(baseUser.email, "wrong"),
      ).rejects.toThrow("INVALID_CREDENTIALS")
    })

    it("rejeita usuário sem senha (OAuth puro)", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...baseUser,
        passwordHash: null,
      })
      await expect(
        service.validateCredentials(baseUser.email, "any"),
      ).rejects.toThrow("INVALID_CREDENTIALS")
    })
  })

  describe("password reset", () => {
    it("emite token e evento para usuário existente", async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser)
      prisma.passwordReset.create.mockResolvedValue({})

      const { token } = await service.issuePasswordReset(baseUser.email)

      expect(token).not.toBe("")
      // persiste apenas o hash, nunca o token bruto
      expect(
        prisma.passwordReset.create.mock.calls[0]?.[0].data.tokenHash,
      ).not.toBe(token)
      expect(events.userPasswordResetRequested).toHaveBeenCalledWith(
        expect.objectContaining({ resetToken: token, userCode: baseUser.code }),
      )
    })

    it("no-op silencioso (anti-enumeração) para email desconhecido", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      const result = await service.issuePasswordReset("ghost@example.com")
      expect(result).toEqual({ token: "", expiresAt: "" })
      expect(prisma.passwordReset.create).not.toHaveBeenCalled()
      expect(events.userPasswordResetRequested).not.toHaveBeenCalled()
    })

    it("consome token válido e atualiza a senha", async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 7n,
        userId: baseUser.id,
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      })
      prisma.$transaction.mockResolvedValue([baseUser, {}])

      const result = await service.consumePasswordReset(
        "raw-token",
        "novaSenha",
      )
      expect(result.code).toBe(baseUser.code)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    it("rejeita token expirado com PASSWORD_RESET_EXPIRED", async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 7n,
        userId: baseUser.id,
        usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      })
      await expect(
        service.consumePasswordReset("raw-token", "x"),
      ).rejects.toThrow("PASSWORD_RESET_EXPIRED")
    })

    it("rejeita token já usado", async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 7n,
        userId: baseUser.id,
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      })
      await expect(
        service.consumePasswordReset("raw-token", "x"),
      ).rejects.toThrow("PASSWORD_RESET_EXPIRED")
    })
  })

  describe("upsertOAuthUser", () => {
    const oauthInput = {
      provider: "google",
      providerAccountId: "google-123",
      email: "oauth@example.com",
      name: "OAuth User",
      avatarUrl: "https://img/avatar.png",
    }

    it("retorna usuário existente quando a identity já existe", async () => {
      prisma.userIdentity.findUnique.mockResolvedValue({ user: baseUser })
      const result = await service.upsertOAuthUser(oauthInput)
      expect(result.code).toBe(baseUser.code)
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it("auto-vincula a User existente de mesmo email", async () => {
      prisma.userIdentity.findUnique.mockResolvedValue(null)
      prisma.user.findUnique.mockResolvedValue(baseUser)

      const result = await service.upsertOAuthUser(oauthInput)

      expect(prisma.userIdentity.create).toHaveBeenCalledWith({
        data: {
          userId: baseUser.id,
          provider: AuthProvider.GOOGLE,
          providerAccountId: "google-123",
        },
      })
      expect(prisma.user.create).not.toHaveBeenCalled()
      expect(result.code).toBe(baseUser.code)
    })

    it("cria novo usuário OAuth e publica user.registered", async () => {
      prisma.userIdentity.findUnique.mockResolvedValue(null)
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        ...baseUser,
        email: oauthInput.email,
        avatarUrl: oauthInput.avatarUrl,
      })

      const result = await service.upsertOAuthUser(oauthInput)
      expect(prisma.user.create).toHaveBeenCalled()
      expect(events.userRegistered).toHaveBeenCalled()
      expect(result.avatarUrl).toBe(oauthInput.avatarUrl)
    })

    it("rejeita provider desconhecido com INVALID_PROVIDER", async () => {
      await expect(
        service.upsertOAuthUser({ ...oauthInput, provider: "facebook" }),
      ).rejects.toBeInstanceOf(RpcException)
    })
  })
})
