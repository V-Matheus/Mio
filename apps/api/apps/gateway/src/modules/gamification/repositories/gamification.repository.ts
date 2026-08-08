import type { Observable } from "rxjs"

export interface UserXpGrpcResponse {
  total: number
  level: string
  progress_to_next: number
  xp_to_next_level: number
  rank: number
}

export interface LeaderboardEntryGrpc {
  user_code: string
  name: string
  avatar_url: string
  total: number
  rank: number
  level: string
}

export interface LeaderboardGrpcResponse {
  entries: LeaderboardEntryGrpc[]
  total_users: number
}

export interface GamificationServiceClient {
  getUserXp(data: { user_code: string }): Observable<UserXpGrpcResponse>
  getLeaderboard(data: {
    limit: number
    offset: number
  }): Observable<LeaderboardGrpcResponse>
}
