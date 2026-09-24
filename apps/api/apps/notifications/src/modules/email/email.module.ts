import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { PrismaModule } from "../../../../core/src/modules/prisma/prisma.module"
import { EmailProcessor } from "./email.processor"
import { EMAIL_QUEUE_NAME, EmailService } from "./email.service"
import { EmailEventRepository } from "./email-event.repository"
import { emailTransporterFactory } from "./email-transporter.factory"

function parseRedisUrl() {
  const urlStr = process.env.REDIS_URL || "redis://localhost:6379"
  try {
    const parsed = new URL(urlStr)
    return {
      host: parsed.hostname || "localhost",
      port: Number.parseInt(parsed.port || "6379", 10),
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      tls: parsed.protocol === "rediss:" ? {} : undefined,
    }
  } catch {
    return {
      host: "localhost",
      port: 6379,
      tls: undefined,
    }
  }
}

const redisConn = parseRedisUrl()

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: redisConn.host,
        port: redisConn.port,
        username: redisConn.username,
        password: redisConn.password,
        tls: redisConn.tls,
      },
    }),
    BullModule.registerQueue({
      name: EMAIL_QUEUE_NAME,
    }),
  ],
  providers: [
    emailTransporterFactory,
    EmailEventRepository,
    EmailService,
    EmailProcessor,
  ],
  exports: [EmailService],
})
export class EmailModule {}
