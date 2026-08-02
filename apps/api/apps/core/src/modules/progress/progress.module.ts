import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { OutboxPublisherService } from "./outbox-publisher.service"
import { ProgressController } from "./progress.controller"
import { ProgressService } from "./progress.service"

@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [ProgressService, OutboxPublisherService],
  exports: [ProgressService, OutboxPublisherService],
})
export class ProgressModule {}
