import { EventsModule } from "@mio/events"
import { Module } from "@nestjs/common"
import { AchievementsCatalogModule } from "./modules/achievements/achievements.module"
import { HealthModule } from "./modules/health/health.module"
import { PrismaModule } from "./modules/prisma/prisma.module"
import { RulesModule } from "./modules/rules/rules.module"

@Module({
  imports: [
    EventsModule,
    PrismaModule,
    HealthModule,
    RulesModule,
    AchievementsCatalogModule,
  ],
  controllers: [],
  providers: [],
})
export class AchievementsModule {}
