import { OutboxPublisherService } from "@mio/events"
import { Module, type OnModuleInit } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { PrismaService } from "../prisma/prisma.service"
import { ProgressEventsPublisher } from "./events/progress-events.publisher"
import { ProgressController } from "./progress.controller"
import { ProgressService } from "./progress.service"

@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressEventsPublisher],
  exports: [ProgressService, ProgressEventsPublisher],
})
export class ProgressModule implements OnModuleInit {
  constructor(
    private readonly outboxPublisher: OutboxPublisherService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.outboxPublisher.setClient(this.prisma)
  }
}
