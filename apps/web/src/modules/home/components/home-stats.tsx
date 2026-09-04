import type {
  HomeStreak,
  HomeXp,
  HomeStats as StatsType,
} from "@/modules/home/types"
import { CardWrapper } from "@/shared/components/card"
import { Icon } from "@/shared/components/icon"
import { formatNumber } from "@/shared/utils"

interface HomeStatsProps {
  streak: HomeStreak
  xp: HomeXp
  stats: StatsType
}

export function HomeStats({ streak, xp, stats }: HomeStatsProps) {
  const items = [
    {
      id: "streak",
      icon: "lucide:flame",
      iconColor: "text-orange-500",
      value: `${streak.streakCurrent} ${streak.streakCurrent === 1 ? "dia" : "dias"}`,
      label: "Sequência",
      cardBorder: "border-orange-500/30",
      cardBg: "bg-orange-500/5 dark:bg-orange-500/10",
      valueColor: "text-orange-600 dark:text-orange-400",
    },
    {
      id: "xp",
      icon: "lucide:star",
      iconColor: "text-amber-500",
      value: `${formatNumber(xp.total)}`,
      label: "XP Total",
      cardBorder: "border-amber-500/30",
      cardBg: "bg-amber-500/5 dark:bg-amber-500/10",
      valueColor: "text-amber-600 dark:text-amber-400",
    },
    {
      id: "lessons",
      icon: "mdi:check-circle",
      iconColor: "text-emerald-500",
      value: `${formatNumber(stats.totalCompletedLessons)}`,
      label: "Aulas Concluídas",
      cardBorder: "border-emerald-500/30",
      cardBg: "bg-emerald-500/5 dark:bg-emerald-500/10",
      valueColor: "text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <CardWrapper
          key={item.id}
          className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${item.cardBorder} ${item.cardBg}`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface/80 shadow-xs">
            <Icon
              icon={item.icon}
              width={24}
              height={24}
              className={item.iconColor}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`font-display font-bold text-xl sm:text-2xl tracking-tight ${item.valueColor}`}
            >
              {item.value}
            </p>
            <p className="text-foreground/60 text-xs font-medium">
              {item.label}
            </p>
          </div>
        </CardWrapper>
      ))}
    </div>
  )
}
