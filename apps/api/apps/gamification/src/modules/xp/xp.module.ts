import { EventsModule, OutboxPublisherService } from "@mio/events"
import { RedisModule } from "@mio/redis"
import { Module, type OnModuleInit } from "@nestjs/common"
import { CoreClientModule } from "../core-client/core-client.module"
import { LeaderboardService } from "../leaderboard/leaderboard.service"
import { PrismaModule } from "../prisma/prisma.module"
import { PrismaService } from "../prisma/prisma.service"
import { LessonCompletedConsumer } from "./consumers/lesson-completed.consumer"
import { XpEventsPublisher } from "./events/xp-events.publisher"
import { XpRulesService } from "./rules/xp-rules.service"
import { XpController } from "./xp.controller"
import { XpService } from "./xp.service"

@Module({
  imports: [PrismaModule, RedisModule, CoreClientModule, EventsModule],
  controllers: [XpController],
  providers: [
    XpService,
    LeaderboardService,
    XpRulesService,
    XpEventsPublisher,
    LessonCompletedConsumer,
  ],
  exports: [XpService, LeaderboardService, XpRulesService],
})
export class XpModule implements OnModuleInit {
  constructor(
    private readonly outboxPublisher: OutboxPublisherService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.outboxPublisher.setClient(this.prisma)
  }
}
