import type { ComponentProps } from "react"
import type { UserAchievement } from "@/modules/achievements/types"
import { Icon } from "@/shared/components/icon"
import { ProgressBar } from "@/shared/components/progress-bar"

interface AchievementCardProps extends ComponentProps<"div"> {
  achievement: UserAchievement
}

/**
 * A identidade visual definitiva (ilustrações/insígnias por conquista) está
 * pendente de assets dedicados (ver spec 05) — enquanto isso, usamos um ícone
 * genérico (medalha) em grayscale quando a conquista ainda está bloqueada.
 */
export function AchievementCard({
  achievement,
  className = "",
  ...props
}: AchievementCardProps) {
  const clampedProgress = Math.min(achievement.progress, achievement.threshold)
  const formattedProgress = new Intl.NumberFormat("pt-BR").format(
    clampedProgress,
  )
  const formattedThreshold = new Intl.NumberFormat("pt-BR").format(
    achievement.threshold,
  )
  const percentage = Math.round((clampedProgress / achievement.threshold) * 100)

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all ${
        achievement.unlocked
          ? "border-amber-200 bg-amber-50/60"
          : "border-zinc-200/80 bg-zinc-50/60 grayscale"
      } ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
            achievement.unlocked
              ? "border-amber-300 bg-amber-100 text-amber-600"
              : "border-zinc-300 bg-zinc-100 text-zinc-400"
          }`}
        >
          <Icon icon="lucide:medal" width={20} height={20} />
        </div>

        <div className="min-w-0 text-left">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="min-w-0 truncate font-display text-sm font-bold text-foreground">
              {achievement.title}
            </h3>
            {!achievement.unlocked && (
              <Icon
                icon="mdi:lock"
                width={13}
                height={13}
                className="shrink-0 text-zinc-400"
              />
            )}
          </div>
          <p className="text-xs text-zinc-500">{achievement.description}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <ProgressBar
          value={achievement.progress}
          max={achievement.threshold}
          className="h-2"
        />
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
          <span>
            {formattedProgress} / {formattedThreshold}
          </span>
          {achievement.unlocked ? (
            <span className="flex items-center gap-1 font-semibold text-amber-600">
              <Icon icon="mdi:check-circle" width={13} height={13} />
              Desbloqueada
            </span>
          ) : (
            <span>{percentage}%</span>
          )}
        </div>
      </div>
    </div>
  )
}
