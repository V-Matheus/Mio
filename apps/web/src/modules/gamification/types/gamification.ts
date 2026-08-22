import type { Level as GqlLevel } from "@/shared/gql/generated/graphql"

export type Level = GqlLevel

export type UserXp = {
  total: number
  level: Level
  progressToNext: number
  xpToNextLevel: number
  rank: number
}

export type LeaderboardEntry = {
  userCode: string
  name: string
  avatarUrl: string | null
  total: number
  rank: number
  level: string
}

export const LEVEL_METADATA: Record<
  string,
  { label: string; badgeClass: string; colorHex: string; icon: string }
> = {
  LEIGO: {
    label: "Leigo",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    colorHex: "#71717A",
    icon: "lucide:sprout",
  },
  INICIANTE: {
    label: "Iniciante",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    colorHex: "#10B981",
    icon: "lucide:compass",
  },
  JUNIOR: {
    label: "Júnior",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    colorHex: "#0284C7",
    icon: "lucide:shield",
  },
  PLENO: {
    label: "Pleno",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    colorHex: "#6366F1",
    icon: "lucide:award",
  },
  SENIOR: {
    label: "Sênior",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    colorHex: "#F59E0B",
    icon: "lucide:crown",
  },
  ESPECIALISTA: {
    label: "Especialista",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    colorHex: "#9333EA",
    icon: "lucide:flame",
  },
}
