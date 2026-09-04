export interface HomeUser {
  code: string
  name: string
  email: string
  avatarUrl: string | null
  roles: string[]
}

export interface HomeXp {
  total: number
  level: string
  progressToNext: number
  xpToNextLevel: number
  rank: number
}

export interface HomeStreak {
  streakCurrent: number
  streakBest: number
  lastStudyDate: string | null
}

export interface HomeStats {
  totalCompletedLessons: number
  completedTracksCount: number
}

export interface HomeTrackProgress {
  trackId: number
  trackSlug: string
  trackTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  currentLessonSlug: string | null
  currentLessonTitle: string | null
}

export interface HomeRecentActivity {
  lessonId: number
  lessonSlug: string
  lessonTitle: string
  trackSlug: string
  trackTitle: string
  completedAt: string
}

export interface HomeData {
  user: HomeUser
  xp: HomeXp
  streak: HomeStreak
  stats: HomeStats
  inProgressTracks: HomeTrackProgress[]
  recentActivities: HomeRecentActivity[]
}
