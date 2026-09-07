import { Module } from "@nestjs/common"
import { CoreClientModule } from "../core-client/core-client.module"
import { GamificationClientModule } from "../gamification-client/gamification-client.module"
import { PrismaModule } from "../prisma/prisma.module"
import { AchievementsController } from "./achievements.controller"
import { AchievementsService } from "./achievements.service"

@Module({
  imports: [PrismaModule, GamificationClientModule, CoreClientModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsCatalogModule {}
