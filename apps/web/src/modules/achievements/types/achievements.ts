export type Achievement = {
  slug: string
  title: string
  description: string
  iconUrl: string | null
  ruleType: string
  threshold: number
}

export type UserAchievement = {
  slug: string
  title: string
  description: string
  iconUrl: string | null
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  threshold: number
}

export type AchievementsPage = {
  items: Achievement[]
  total: number
}

export type UserAchievementsPage = {
  items: UserAchievement[]
  total: number
  unlockedTotal: number
}
