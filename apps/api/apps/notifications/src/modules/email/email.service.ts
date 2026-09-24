import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Queue } from "bullmq"
import { EmailEventRepository } from "./email-event.repository"

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
    private readonly emailEventRepository: EmailEventRepository,
  ) {}

  async enqueue(data: EmailJobData, eventId?: string): Promise<void> {
    if (eventId) {
      const claimed = await this.emailEventRepository.claimForDispatch(eventId)
      if (!claimed) {
        this.logger.log(`Evento ${eventId} já processado; e-mail ignorado`)
        return
      }
    }

    try {
      const job = await this.emailQueue.add("send-email", data, {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000, // 1s, 5s (aproximado por exp), 30s, etc.
        },
        removeOnComplete: true,
        ...(eventId ? { jobId: `outbox-${eventId}` } : {}),
      })

      this.logger.log(
        `Job [${job.id}] enfileirado no BullMQ (template: ${data.template}, destinatário: ${data.to})`,
      )
    } catch (error) {
      if (eventId) {
        await this.emailEventRepository.releaseDispatchClaim(eventId)
      }
      throw error
    }
  }
}
