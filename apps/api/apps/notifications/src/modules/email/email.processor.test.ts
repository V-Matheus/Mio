import { Job } from "bullmq"
import type { Transporter } from "nodemailer"
import { describe, expect, it, vi } from "vitest"
import { EmailProcessor } from "./email.processor"
import type { EmailJobData } from "./email.service"

describe("EmailProcessor", () => {
  it("deve chamar sendMail no transporter com os dados do job", async () => {
    const mockTransporter = {
      sendMail: vi.fn().mockResolvedValue({ messageId: "msg-123" }),
    } as unknown as Transporter

    const processor = new EmailProcessor(mockTransporter)

    const mockJob = {
      id: "job-1",
      attemptsMade: 0,
      data: {
        to: "user@example.com",
        subject: "Teste",
        html: "<p>Teste</p>",
        text: "Teste",
        template: "welcome",
      },
    } as Job<EmailJobData>

    await processor.process(mockJob)

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: expect.any(String),
      to: "user@example.com",
      subject: "Teste",
      html: "<p>Teste</p>",
      text: "Teste",
    })
  })
})
