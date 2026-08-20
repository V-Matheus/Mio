import { Module } from "@nestjs/common"
import { AuthModule } from "../auth/auth.module"
import { GamificationModule } from "../gamification/gamification.module"
import { ProgressModule } from "../progress/progress.module"
import { ProfileResolver } from "./profile.resolver"
import { ProfileService } from "./profile.service"

@Module({
  imports: [AuthModule, GamificationModule, ProgressModule],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
