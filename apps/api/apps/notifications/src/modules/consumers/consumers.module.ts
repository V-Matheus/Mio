import { Module } from "@nestjs/common"
import { EmailModule } from "../email/email.module"
import { PasswordResetConsumer } from "./password-reset.consumer"
import { UserRegisteredConsumer } from "./user-registered.consumer"

@Module({
  imports: [EmailModule],
  providers: [UserRegisteredConsumer, PasswordResetConsumer],
})
export class ConsumersModule {}
