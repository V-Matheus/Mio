import type { ComponentProps } from "react"
import { Icon } from "@/components/icon"
import { LEVEL_METADATA, type Level } from "@/lib/gamification/types"

interface XpBadgeProps extends ComponentProps<"div"> {
  total: number
  level?: Level | string
  compact?: boolean
}

export function XpBadge({
  total,
  level = "LEIGO",
  compact = false,
  className = "",
  ...props
}: XpBadgeProps) {
  const meta = LEVEL_METADATA[level] ?? LEVEL_METADATA.LEIGO

  const formattedXp = new Intl.NumberFormat("pt-BR").format(total)

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-transform hover:scale-105 ${meta?.badgeClass} ${className}`}
        title={`${formattedXp} XP • Nível ${meta?.label}`}
        {...props}
      >
        <Icon
          icon="lucide:zap"
          width={14}
          height={14}
          className="text-amber-500 fill-amber-500 shrink-0"
        />
        <span className="font-display font-bold tracking-tight">
          {formattedXp} XP
        </span>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium shadow-2xs transition-all hover:shadow-xs ${meta?.badgeClass} ${className}`}
      {...props}
    >
      <Icon
        icon="lucide:zap"
        width={16}
        height={16}
        className="text-amber-500 fill-amber-500 shrink-0"
      />
      <span className="font-display font-bold">{formattedXp} XP</span>
      <span className="text-zinc-300">•</span>
      <span className="inline-flex items-center gap-1 font-semibold">
        <Icon icon={meta?.icon ?? "lucide:award"} width={14} height={14} />
        {meta?.label}
      </span>
    </div>
  )
}
