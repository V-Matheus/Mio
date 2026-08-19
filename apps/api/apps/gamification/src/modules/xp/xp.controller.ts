import { gamificationContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { LeaderboardService } from "../leaderboard/leaderboard.service"
import { XpService } from "./xp.service"

const SERVICE_NAME = gamificationContract.service

export interface GetUserXpRequest {
  userCode: string
}

export interface UserXpResponse {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
}

export interface StreakInfoResponse {
  streakCurrent: number
  streakBest: number
  lastStudyDate: string
}

export interface WeeklyXpDayResponse {
  day: string
  date: string
  xp: number
}

export interface WeeklyXpSummaryResponse {
  days: WeeklyXpDayResponse[]
  totalWeeklyXp: number
}

export interface GamificationProfileResponse {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
  streak: StreakInfoResponse
  weeklyXp: WeeklyXpSummaryResponse
}

export interface GetLeaderboardRequest {
  limit: number
  offset: number
}

export interface LeaderboardResponse {
  entries: Array<{
    userCode: string
    name: string
    avatarUrl: string
    total: number
    rank: number
    level: string
  }>
  totalUsers: number
}

@Controller()
export class XpController {
  constructor(
    private readonly xpService: XpService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @GrpcMethod(SERVICE_NAME, "GetUserXp")
  async getUserXp(data: GetUserXpRequest): Promise<UserXpResponse> {
    const detail = await this.xpService.getUserXp(data.userCode)
    return {
      total: detail.total,
      level: detail.level,
      progressToNext: detail.progressToNext,
      xpToNextLevel: detail.xpToNextLevel,
      rank: detail.rank,
    }
  }

  @GrpcMethod(SERVICE_NAME, "GetUserGamificationProfile")
  async getUserGamificationProfile(
    data: GetUserXpRequest,
  ): Promise<GamificationProfileResponse> {
    const detail = await this.xpService.getUserGamificationProfile(
      data.userCode,
    )
    return {
      total: detail.total,
      level: detail.level,
      progressToNext: detail.progressToNext,
      xpToNextLevel: detail.xpToNextLevel,
      rank: detail.rank,
      streak: {
        streakCurrent: detail.streak.streakCurrent,
        streakBest: detail.streak.streakBest,
        lastStudyDate: detail.streak.lastStudyDate ?? "",
      },
      weeklyXp: {
        days: detail.weeklyXp.days,
        totalWeeklyXp: detail.weeklyXp.totalWeeklyXp,
      },
    }
  }

  @GrpcMethod(SERVICE_NAME, "GetLeaderboard")
  async getLeaderboard(
    data: GetLeaderboardRequest,
  ): Promise<LeaderboardResponse> {
    const limit = data.limit ?? 50
    const offset = data.offset ?? 0

    const result = await this.leaderboardService.getLeaderboard(limit, offset)

    return {
      entries: result.entries.map((entry) => ({
        userCode: entry.userCode,
        name: entry.name,
        avatarUrl: entry.avatarUrl,
        total: entry.total,
        rank: entry.rank,
        level: entry.level,
      })),
      totalUsers: result.totalUsers,
    }
  }
}
