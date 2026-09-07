import { Module } from "@nestjs/common"
import { GamificationClientModule } from "../gamification-client/gamification-client.module"
import { PrismaModule } from "../prisma/prisma.module"
import { AchievementsController } from "./achievements.controller"
import { AchievementsService } from "./achievements.service"

@Module({
  imports: [PrismaModule, GamificationClientModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsCatalogModule {}
