import Link from "next/link"
import type { HomeTrackProgress } from "@/modules/home/types"
import { CardWrapper } from "@/shared/components/card"
import { Icon } from "@/shared/components/icon"
import { ProgressBar } from "@/shared/components/progress-bar"
import { formatNumber } from "@/shared/utils"

interface InProgressCardProps {
  track: HomeTrackProgress
  index?: number
}

const themeStyles = [
  {
    iconBg: "bg-orange-500/10 text-orange-500",
    button:
      "bg-primary hover:bg-primary-hover text-white shadow-xs active:translate-y-[1px]",
  },
  {
    iconBg: "bg-emerald-500/10 text-emerald-500",
    button:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:translate-y-[1px]",
  },
  {
    iconBg: "bg-indigo-500/10 text-indigo-500",
    button:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:translate-y-[1px]",
  },
]

export function InProgressCard({ track, index = 0 }: InProgressCardProps) {
  const theme = themeStyles[index % themeStyles.length] ?? themeStyles[0]!
  const targetUrl = track.currentLessonSlug
    ? `/trilhas/${track.trackSlug}/aula/${track.currentLessonSlug}`
    : `/trilhas/${track.trackSlug}`

  const estimatedXp = track.completedLessons * 50

  return (
    <CardWrapper className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md space-y-5">
      {/* Top Header: Ícone + Título e Subtítulo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg}`}
          >
            <Icon icon="lucide:code-2" width={22} height={22} />
          </div>

          <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {track.progressPercentage}%
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            {track.trackTitle}
          </h3>
          <p className="text-xs text-foreground/60 line-clamp-1">
            {track.currentLessonTitle
              ? `Próxima: ${track.currentLessonTitle}`
              : "Trilha de Aprendizado"}
          </p>
        </div>
      </div>

      {/* Barra de Progresso e Métricas */}
      <div className="space-y-4">
        <div className="space-y-2">
          <ProgressBar
            value={track.progressPercentage}
            max={100}
            className="h-2.5 bg-zinc-100"
          />

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground/70">
              <Icon
                icon="lucide:check"
                width={14}
                height={14}
                className="text-emerald-500"
              />
              <span>
                {track.completedLessons}/{track.totalLessons} aulas
              </span>
            </div>

            <div className="flex items-center gap-1 font-bold text-amber-500">
              <Icon icon="lucide:star" width={14} height={14} />
              <span>{formatNumber(estimatedXp)} XP</span>
            </div>
          </div>
        </div>

        {/* Botão de Ação */}
        <Link
          href={targetUrl}
          className={`mt-1 w-full cursor-pointer rounded-xl py-2.5 font-display font-bold text-sm transition-all text-center flex items-center justify-center gap-2 ${theme.button}`}
        >
          Continuar Aprendendo
          <Icon icon="lucide:arrow-right" width={16} height={16} />
        </Link>
      </div>
    </CardWrapper>
  )
}
