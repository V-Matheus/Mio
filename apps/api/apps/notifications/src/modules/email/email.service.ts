import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Queue } from "bullmq"

export type EmailJobData = {
  to: string
  subject: string
  html: string
  text: string
  template: string
}

export const EMAIL_QUEUE_NAME = "mio-emails"

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(
    @InjectQueue(EMAIL_QUEUE_NAME)
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async enqueue(data: EmailJobData): Promise<void> {
    const job = await this.emailQueue.add("send-email", data, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000, // 1s, 5s (aproximado por exp), 30s, etc.
      },
      removeOnComplete: true,
    })

    this.logger.log(
      `Job [${job.id}] enfileirado no BullMQ (template: ${data.template}, destinatário: ${data.to})`,
    )
  }
}
