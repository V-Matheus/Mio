import { EventsModule } from "@mio/events"
import { Module } from "@nestjs/common"
import { HealthModule } from "./modules/health/health.module"
import { PrismaModule } from "./modules/prisma/prisma.module"
import { XpModule } from "./modules/xp/xp.module"

@Module({
  imports: [EventsModule, PrismaModule, HealthModule, XpModule],
  controllers: [],
  providers: [],
})
export class GamificationModule {}
