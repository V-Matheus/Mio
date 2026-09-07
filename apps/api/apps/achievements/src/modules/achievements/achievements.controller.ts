import { achievementsContract } from "@mio/grpc-contracts"
import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { AchievementsService } from "./achievements.service"

const SERVICE_NAME = achievementsContract.service
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

function resolvePagination(limit?: number, offset?: number) {
  const resolvedLimit = Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT)
  const resolvedOffset = offset && offset > 0 ? offset : 0
  return { limit: resolvedLimit, offset: resolvedOffset }
}

export interface ListAchievementsRequest {
  limit?: number
  offset?: number
}

export interface AchievementResponse {
  slug: string
  title: string
  description: string
  iconUrl: string
  ruleType: string
  threshold: number
}

export interface AchievementsListResponse {
  achievements: AchievementResponse[]
  total: number
}

export interface GetUserAchievementsRequest {
  userCode: string
  limit?: number
  offset?: number
}

export interface UserAchievementEntryResponse {
  slug: string
  title: string
  description: string
  iconUrl: string
  unlocked: boolean
  unlockedAt: string
  progress: number
  threshold: number
}

export interface UserAchievementsResponse {
  entries: UserAchievementEntryResponse[]
  total: number
  unlockedTotal: number
}

@Controller()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @GrpcMethod(SERVICE_NAME, "ListAchievements")
  async listAchievements(
    data: ListAchievementsRequest,
  ): Promise<AchievementsListResponse> {
    const { limit, offset } = resolvePagination(data?.limit, data?.offset)
    const page = await this.achievementsService.listAchievements(limit, offset)
    return { achievements: page.achievements, total: page.total }
  }

  @GrpcMethod(SERVICE_NAME, "GetUserAchievements")
  async getUserAchievements(
    data: GetUserAchievementsRequest,
  ): Promise<UserAchievementsResponse> {
    const { limit, offset } = resolvePagination(data?.limit, data?.offset)
    const page = await this.achievementsService.getUserAchievements(
      data.userCode,
      limit,
      offset,
    )
    return {
      entries: page.entries,
      total: page.total,
      unlockedTotal: page.unlockedTotal,
    }
  }
}
