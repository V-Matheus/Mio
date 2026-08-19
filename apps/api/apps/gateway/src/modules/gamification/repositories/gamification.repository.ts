import type { Observable } from "rxjs"

export interface UserXpGrpcResponse {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
}

export interface LeaderboardEntryGrpc {
  userCode: string
  name: string
  avatarUrl: string
  total: number
  rank: number
  level: string
}

export interface LeaderboardGrpcResponse {
  entries: LeaderboardEntryGrpc[]
  totalUsers: number
}

export interface StreakInfoGrpcResponse {
  streakCurrent: number
  streakBest: number
  lastStudyDate: string
}

export interface WeeklyXpDayGrpcResponse {
  day: string
  date: string
  xp: number
}

export interface WeeklyXpSummaryGrpcResponse {
  days: WeeklyXpDayGrpcResponse[]
  totalWeeklyXp: number
}

export interface GamificationProfileGrpcResponse {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
  streak: StreakInfoGrpcResponse
  weeklyXp: WeeklyXpSummaryGrpcResponse
}

export interface GamificationServiceClient {
  getUserXp(data: { userCode: string }): Observable<UserXpGrpcResponse>
  getLeaderboard(data: {
    limit: number
    offset: number
  }): Observable<LeaderboardGrpcResponse>
  getUserGamificationProfile(data: {
    userCode: string
  }): Observable<GamificationProfileGrpcResponse>
}
