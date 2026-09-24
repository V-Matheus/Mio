import { OutboxPublisherService } from "@mio/events"
import { Module, type OnModuleInit } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { PrismaService } from "../prisma/prisma.service"
import { UserEventsPublisher } from "./events/user-events.publisher"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UserEventsPublisher],
  exports: [UsersService, UserEventsPublisher],
})
export class UsersModule implements OnModuleInit {
  constructor(
    private readonly outboxPublisher: OutboxPublisherService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.outboxPublisher.setClient(this.prisma)
  }
}
