import { CardWrapper } from "@/components/card"
import { Icon } from "@/components/icon"
import type { UserProfile } from "@/lib/profile/types"
import { formatNumber } from "@/utils"

interface QuickStatsProps {
  profile: UserProfile
}

export function QuickStats({ profile }: QuickStatsProps) {
  const { streak, stats } = profile

  const items = [
    {
      id: "streak",
      title: "Dias consecutivos",
      value: `${streak.streakCurrent} ${streak.streakCurrent === 1 ? "dia" : "dias"}`,
      subtitle:
        streak.streakBest > 0
          ? `Melhor ofensiva: ${streak.streakBest} dias`
          : "Comece sua sequência!",
      icon: "lucide:flame",
      iconColor: "text-amber-500",
      bgGradient: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      id: "completed-tracks",
      title: "Cursos completos",
      value: `${formatNumber(stats.completedTracksCount)} ${stats.completedTracksCount === 1 ? "curso" : "cursos"}`,
      subtitle: "Trilhas pedagógicas finalizadas",
      icon: "lucide:graduation-cap",
      iconColor: "text-sky-500",
      bgGradient: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
    {
      id: "completed-lessons",
      title: "Lições concluídas",
      value: `${formatNumber(stats.totalCompletedLessons)} ${stats.totalCompletedLessons === 1 ? "lição" : "lições"}`,
      subtitle: "Exercícios e leituras finalizadas",
      icon: "lucide:zap",
      iconColor: "text-emerald-500",
      bgGradient: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <CardWrapper
          key={item.id}
          className="relative flex items-center gap-4 overflow-hidden p-5 transition-transform hover:-translate-y-0.5"
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${item.borderColor} ${item.bgGradient}`}
          >
            <Icon
              icon={item.icon}
              width={24}
              height={24}
              className={item.iconColor}
            />
          </div>

          <div className="min-w-0 space-y-0.5">
            <span className="text-foreground/60 text-xs font-medium">
              {item.title}
            </span>
            <p className="font-display font-bold text-xl text-foreground tracking-tight">
              {item.value}
            </p>
            <p className="truncate text-foreground/50 text-xs">
              {item.subtitle}
            </p>
          </div>
        </CardWrapper>
      ))}
    </div>
  )
}
