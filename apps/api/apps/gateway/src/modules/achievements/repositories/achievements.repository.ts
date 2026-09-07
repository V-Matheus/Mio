import type { Observable } from "rxjs"

export interface AchievementGrpcResponse {
  slug: string
  title: string
  description: string
  iconUrl: string
  ruleType: string
  threshold: number
}

export interface AchievementsListGrpcResponse {
  achievements: AchievementGrpcResponse[]
  total: number
}

export interface UserAchievementEntryGrpcResponse {
  slug: string
  title: string
  description: string
  iconUrl: string
  unlocked: boolean
  unlockedAt: string
  progress: number
  threshold: number
}

export interface UserAchievementsGrpcResponse {
  entries: UserAchievementEntryGrpcResponse[]
  total: number
  unlockedTotal: number
}

export interface AchievementsServiceClient {
  listAchievements(data: {
    limit: number
    offset: number
  }): Observable<AchievementsListGrpcResponse>
  getUserAchievements(data: {
    userCode: string
    limit: number
    offset: number
  }): Observable<UserAchievementsGrpcResponse>
}
