import { describe, expect, it, vi } from "vitest"
import type { EmailService } from "../email/email.service"
import { UserRegisteredConsumer } from "./user-registered.consumer"

describe("UserRegisteredConsumer", () => {
  it("deve renderizar o template de boas-vindas e enfileirar o e-mail ao receber a mensagem", async () => {
    const mockEmailService = {
      enqueue: vi.fn().mockResolvedValue(undefined),
    } as unknown as EmailService

    const consumer = new UserRegisteredConsumer(mockEmailService)

    const payload = {
      userCode: "usr_123",
      email: "novo.usuario@example.com",
      name: "Novo Usuário",
      registeredAt: new Date().toISOString(),
    }

    await consumer.handleMessage(payload)

    expect(mockEmailService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "novo.usuario@example.com",
        subject: "Bem-vindo ao Mio!",
        template: "welcome",
        html: expect.stringContaining("Novo Usuário"),
      }),
    )
  })
})
