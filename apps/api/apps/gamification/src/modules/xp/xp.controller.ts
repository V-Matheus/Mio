import { gamificationContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { LeaderboardService } from "../leaderboard/leaderboard.service"
import { XpService } from "./xp.service"

const SERVICE_NAME = gamificationContract.service

export interface GetUserXpRequest {
  user_code: string
}

export interface UserXpResponse {
  total: number
  level: string
  progress_to_next: number
  xp_to_next_level: number
  rank: number
}

export interface GetLeaderboardRequest {
  limit?: number
  offset?: number
}

export interface LeaderboardResponse {
  entries: Array<{
    user_code: string
    name: string
    avatar_url: string
    total: number
    rank: number
    level: string
  }>
  total_users: number
}

@Controller()
export class XpController {
  constructor(
    private readonly xpService: XpService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @GrpcMethod(SERVICE_NAME, "GetUserXp")
  async getUserXp(data: GetUserXpRequest): Promise<UserXpResponse> {
    const detail = await this.xpService.getUserXp(data.user_code)
    return {
      total: detail.total,
      level: detail.level,
      progress_to_next: detail.progressToNext,
      xp_to_next_level: detail.xpToNextLevel,
      rank: detail.rank,
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
        user_code: entry.userCode,
        name: entry.name,
        avatar_url: entry.avatarUrl,
        total: entry.total,
        rank: entry.rank,
        level: entry.level,
      })),
      total_users: result.totalUsers,
    }
  }
}
