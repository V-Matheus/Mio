import type { MeUser } from "@/lib/auth/types"
import type { UserXp } from "@/lib/gamification/types"

export type ProfileUser = MeUser

export interface UserStreak {
  streakCurrent: number
  streakBest: number
  lastStudyDate: string | null
}

export interface UserProfileStats {
  totalCompletedLessons: number
  completedTracksCount: number
}

export interface WeeklyXpDay {
  day: string
  date: string
  xp: number
}

export interface WeeklyXpSummary {
  days: WeeklyXpDay[]
  totalWeeklyXp: number
}

export interface TrackProgressSummary {
  trackId: number
  trackSlug: string
  trackTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  currentLessonSlug: string | null
  currentLessonTitle: string | null
}

export interface RecentActivityEntry {
  lessonId: number
  lessonSlug: string
  lessonTitle: string
  trackSlug: string
  trackTitle: string
  completedAt: string
}

export interface UserProfile {
  user: ProfileUser
  xp: UserXp
  streak: UserStreak
  stats: UserProfileStats
  weeklyXp: WeeklyXpSummary
  inProgressTracks: TrackProgressSummary[]
  recentActivities: RecentActivityEntry[]
}
