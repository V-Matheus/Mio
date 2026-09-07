import type { HomeRecentActivity, HomeStreak } from "@/modules/home/types"
import { CardWrapper } from "@/shared/components/card"
import { Icon } from "@/shared/components/icon"
import { formatRelativeTime } from "@/shared/utils"

interface RecentActivitiesProps {
  activities: HomeRecentActivity[]
  streak: HomeStreak
}

export function RecentActivities({
  activities,
  streak,
}: RecentActivitiesProps) {
  const hasActivities = activities.length > 0
  const showStreakBanner = streak.streakCurrent > 0

  return (
    <CardWrapper className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <Icon
          icon="lucide:history"
          width={20}
          height={20}
          className="text-primary"
        />
        <h2 className="font-display font-bold text-lg text-foreground tracking-tight sm:text-xl">
          Atividades Recentes
        </h2>
      </div>

      {!hasActivities && !showStreakBanner ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-foreground/50">
          <Icon
            icon="lucide:history"
            width={32}
            height={32}
            className="mb-2 opacity-40"
          />
          <p className="text-sm font-medium">Nenhuma atividade recente</p>
          <p className="text-xs">
            Complete sua primeira aula para ver seu progresso aqui!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {/* Aulas Concluídas */}
          {activities.map((activity) => (
            <div
              key={`${activity.lessonId}-${activity.completedAt}`}
              className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Icon icon="mdi:check-circle" width={20} height={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    Aula concluída
                  </p>
                  <p className="text-xs text-foreground/60 truncate">
                    {activity.lessonTitle} • {activity.trackTitle}
                  </p>
                  <p className="text-[11px] text-foreground/40 mt-0.5">
                    {formatRelativeTime(activity.completedAt) || "Recente"}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 font-bold text-amber-600 dark:text-amber-400 text-xs">
                +50 XP
              </span>
            </div>
          ))}

          {/* Evento de Ofensiva / Sequência */}
          {showStreakBanner && (
            <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Icon icon="lucide:flame" width={20} height={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    Sequência de {streak.streakCurrent}{" "}
                    {streak.streakCurrent === 1 ? "dia" : "dias"}!
                  </p>
                  <p className="text-xs text-foreground/60 truncate">
                    Continue assim para manter sua sequência
                  </p>
                  <p className="text-[11px] text-foreground/40 mt-0.5">
                    {streak.lastStudyDate
                      ? formatRelativeTime(streak.lastStudyDate) ||
                        "Recentemente"
                      : "Recentemente"}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-orange-500/10 px-2.5 py-1 font-bold text-orange-600 dark:text-orange-400 text-xs">
                🔥 Fogo
              </span>
            </div>
          )}
        </div>
      )}
    </CardWrapper>
  )
}
