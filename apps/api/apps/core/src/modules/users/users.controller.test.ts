import { describe, expect, it, vi } from "vitest"
import { UsersController } from "./users.controller"
import type { UsersService } from "./users.service"

function makeController() {
  const users = {
    register: vi.fn().mockResolvedValue({}),
    validateCredentials: vi.fn().mockResolvedValue({}),
    findByEmail: vi.fn().mockResolvedValue({}),
    findByCode: vi.fn().mockResolvedValue({}),
    upsertOAuthUser: vi.fn().mockResolvedValue({}),
    issuePasswordReset: vi.fn().mockResolvedValue({ token: "", expiresAt: "" }),
    consumePasswordReset: vi.fn().mockResolvedValue({}),
    updateUserRole: vi.fn().mockResolvedValue({}),
  }
  return {
    controller: new UsersController(users as unknown as UsersService),
    users,
  }
}

describe("UsersController", () => {
  it("register repassa o objeto data inteiro", async () => {
    const { controller, users } = makeController()
    const data = { email: "a@b.com", name: "V", password: "pw" }
    await controller.register(data)
    expect(users.register).toHaveBeenCalledWith(data)
  })

  it("validateCredentials desempacota email e password (posicional)", async () => {
    const { controller, users } = makeController()
    await controller.validateCredentials({ email: "a@b.com", password: "pw" })
    expect(users.validateCredentials).toHaveBeenCalledWith("a@b.com", "pw")
  })

  it("findByEmail desempacota o email", async () => {
    const { controller, users } = makeController()
    await controller.findByEmail({ email: "a@b.com" })
    expect(users.findByEmail).toHaveBeenCalledWith("a@b.com")
  })

  it("findByCode desempacota o code", async () => {
    const { controller, users } = makeController()
    await controller.findByCode({ code: "c1" })
    expect(users.findByCode).toHaveBeenCalledWith("c1")
  })

  it("upsertOAuthUser repassa o objeto data inteiro", async () => {
    const { controller, users } = makeController()
    const data = {
      provider: "google",
      providerAccountId: "g-1",
      email: "a@b.com",
      name: "V",
      avatarUrl: "",
    }
    await controller.upsertOAuthUser(data)
    expect(users.upsertOAuthUser).toHaveBeenCalledWith(data)
  })

  it("issuePasswordReset desempacota o email", async () => {
    const { controller, users } = makeController()
    await controller.issuePasswordReset({ email: "a@b.com" })
    expect(users.issuePasswordReset).toHaveBeenCalledWith("a@b.com")
  })

  it("consumePasswordReset desempacota token e newPassword (posicional)", async () => {
    const { controller, users } = makeController()
    await controller.consumePasswordReset({ token: "t", newPassword: "np" })
    expect(users.consumePasswordReset).toHaveBeenCalledWith("t", "np")
  })

  it("updateUserRole desempacota code e role (posicional)", async () => {
    const { controller, users } = makeController()
    await controller.updateUserRole({ code: "c1", role: "ADMIN" })
    expect(users.updateUserRole).toHaveBeenCalledWith("c1", "ADMIN")
  })
})
