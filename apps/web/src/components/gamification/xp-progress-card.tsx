import type { ComponentProps } from "react"
import { Icon } from "@/components/icon"
import { LEVEL_METADATA, type UserXp } from "@/lib/gamification/types"
import { ProgressBar } from "./progress-bar"
import { XpBadge } from "./xp-badge"

interface XpProgressCardProps extends ComponentProps<"div"> {
  xp: UserXp
  userName?: string
}

export function XpProgressCard({
  xp,
  userName,
  className = "",
  ...props
}: XpProgressCardProps) {
  const meta = LEVEL_METADATA[xp.level] ?? LEVEL_METADATA.LEIGO
  const formattedTotal = new Intl.NumberFormat("pt-BR").format(xp.total)
  const formattedNext = new Intl.NumberFormat("pt-BR").format(xp.xpToNextLevel)

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      {/* Background subtle decorative blur */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: meta?.colorHex }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Meu Desempenho
            </span>
            {xp.rank > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                <Icon icon="lucide:trophy" width={12} height={12} />#{xp.rank}{" "}
                no Ranking
              </span>
            )}
          </div>
          {userName && (
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">
              {userName}
            </h2>
          )}
        </div>

        <XpBadge total={xp.total} level={xp.level} />
      </div>

      {/* Progress section */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span className="font-medium text-foreground">
            Nível{" "}
            <strong className="font-bold text-primary">{meta?.label}</strong>
          </span>
          {xp.xpToNextLevel > 0 ? (
            <span>
              Faltam{" "}
              <strong className="font-semibold text-foreground">
                {formattedNext} XP
              </strong>{" "}
              para o próximo nível
            </span>
          ) : (
            <span className="font-semibold text-emerald-600">
              Nível Máximo Alcançado! 🎉
            </span>
          )}
        </div>

        <ProgressBar value={xp.progressToNext} max={100} className="h-3" />

        <div className="flex justify-between text-[11px] font-medium text-zinc-400">
          <span>{formattedTotal} XP</span>
          <span>{xp.progressToNext}%</span>
        </div>
      </div>
    </div>
  )
}
