import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Inject, Logger } from "@nestjs/common"
import { Job } from "bullmq"
import type { Transporter } from "nodemailer"
import { EMAIL_QUEUE_NAME, type EmailJobData } from "./email.service"
import { EMAIL_TRANSPORTER } from "./email-transporter.factory"

@Processor(EMAIL_QUEUE_NAME)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name)

  constructor(
    @Inject(EMAIL_TRANSPORTER)
    private readonly transporter: Transporter,
  ) {
    super()
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, html, text, template } = job.data
    const attempt = job.attemptsMade + 1

    this.logger.log(
      `[Job ${job.id}] Processando envio de e-mail (template: ${template}, to: ${to}, tentativa: ${attempt})`,
    )

    try {
      const from = process.env.EMAIL_FROM || "Mio <ola@mio.dev>"

      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      })

      this.logger.log(
        `[Job ${job.id}] E-mail ${template} enviado com sucesso para ${to}. MessageId: ${info.messageId}`,
      )
    } catch (err) {
      this.logger.error(
        `[Job ${job.id}] Falha ao enviar e-mail ${template} para ${to} (tentativa ${attempt}): ${(err as Error).message}`,
      )
      throw err
    }
  }
}
