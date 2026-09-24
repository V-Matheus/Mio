import { Module } from "@nestjs/common"
import { ConsumersModule } from "./modules/consumers/consumers.module"
import { EmailModule } from "./modules/email/email.module"
import { HealthModule } from "./modules/health/health.module"

@Module({
  imports: [HealthModule, EmailModule, ConsumersModule],
  controllers: [],
  providers: [],
})
export class NotificationsModule {}
