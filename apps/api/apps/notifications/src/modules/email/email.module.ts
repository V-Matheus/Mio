import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { EmailProcessor } from "./email.processor"
import { EMAIL_QUEUE_NAME, EmailService } from "./email.service"
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
    }
  } catch {
    return {
      host: "localhost",
      port: 6379,
    }
  }
}

const redisConn = parseRedisUrl()

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: redisConn.host,
        port: redisConn.port,
        username: redisConn.username,
        password: redisConn.password,
      },
    }),
    BullModule.registerQueue({
      name: EMAIL_QUEUE_NAME,
    }),
  ],
  providers: [emailTransporterFactory, EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
