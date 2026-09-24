import { Queue } from "bullmq"
import { describe, expect, it, vi } from "vitest"
import { EmailService } from "./email.service"

describe("EmailService", () => {
  it("deve adicionar o job de email na fila BullMQ com configurações de retry exponencial", async () => {
    const mockQueue = {
      add: vi.fn().mockResolvedValue({ id: "job-123" }),
    } as unknown as Queue

    const service = new EmailService(mockQueue)

    const jobData = {
      to: "test@example.com",
      subject: "Boas-vindas",
      html: "<p>Olá</p>",
      text: "Olá",
      template: "welcome",
    }

    await service.enqueue(jobData)

    expect(mockQueue.add).toHaveBeenCalledWith("send-email", jobData, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
    })
  })
})
