import { Injectable } from "@nestjs/common"
import { AuthService } from "../auth/auth.service"
import { GamificationGatewayService } from "../gamification/gamification.service"
import { ProgressGatewayService } from "../progress/progress.service"
import type { UserProfile } from "./profile.types"

@Injectable()
export class ProfileService {
  constructor(
    private readonly authService: AuthService,
    private readonly gamificationService: GamificationGatewayService,
    private readonly progressService: ProgressGatewayService,
  ) {}

  async getProfile(userCode: string): Promise<UserProfile> {
    const [user, gamification, progress] = await Promise.all([
      this.authService.me(userCode),
      this.gamificationService.getUserGamificationProfile(userCode),
      this.progressService.getStudentProfileProgress(userCode),
    ])

    return {
      user,
      xp: gamification.userXp,
      streak: {
        streakCurrent: gamification.streak.streakCurrent,
        streakBest: gamification.streak.streakBest,
        lastStudyDate: gamification.streak.lastStudyDate,
      },
      stats: progress.stats,
      weeklyXp: gamification.weeklyXp,
      inProgressTracks: progress.inProgressTracks,
      recentActivities: progress.recentActivities,
    }
  }
}
