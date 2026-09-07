import { EventsModule, OutboxPublisherService } from "@mio/events"
import { Module, type OnModuleInit } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { PrismaService } from "../prisma/prisma.service"
import { LessonCompletedConsumer } from "./consumers/lesson-completed.consumer"
import { XpRewardedConsumer } from "./consumers/xp-rewarded.consumer"
import { AchievementEventsPublisher } from "./events/achievement-events.publisher"
import { RulesEngineService } from "./rules-engine.service"

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [
    RulesEngineService,
    AchievementEventsPublisher,
    LessonCompletedConsumer,
    XpRewardedConsumer,
  ],
  exports: [RulesEngineService],
})
export class RulesModule implements OnModuleInit {
  constructor(
    private readonly outboxPublisher: OutboxPublisherService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.outboxPublisher.setClient(this.prisma)
  }
}
