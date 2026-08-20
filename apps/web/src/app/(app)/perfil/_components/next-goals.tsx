import { Icon } from "@/components/icon"
import { LEVEL_METADATA } from "@/lib/gamification/types"
import type { UserProfile } from "@/lib/profile/types"
import { formatNumber } from "@/utils"

interface NextGoalsProps {
  profile: UserProfile
}

export function NextGoals({ profile }: NextGoalsProps) {
  const { xp, streak, inProgressTracks, stats } = profile

  // Nível seguinte
  const levelKeys = Object.keys(LEVEL_METADATA)
  const currentLevelIndex = levelKeys.indexOf(xp.level)
  const nextLevelKey =
    currentLevelIndex >= 0 && currentLevelIndex < levelKeys.length - 1
      ? levelKeys[currentLevelIndex + 1]
      : null
  const nextLevelLabel = nextLevelKey
    ? (LEVEL_METADATA[nextLevelKey]?.label ?? nextLevelKey)
    : "Nível Máximo"

  // Meta de streak
  const streakTarget =
    streak.streakCurrent < 7
      ? 7
      : streak.streakCurrent < 30
        ? 30
        : streak.streakCurrent < 100
          ? 100
          : streak.streakCurrent + 15
  const streakRemaining = Math.max(streakTarget - streak.streakCurrent, 0)
  const streakProgress = Math.min(
    Math.round((streak.streakCurrent / streakTarget) * 100),
    100,
  )

  // Meta de cursos
  const tracksTarget = Math.max((stats.completedTracksCount || 0) + 1, 3)
  const tracksRemaining = Math.max(
    tracksTarget - (stats.completedTracksCount || 0),
    1,
  )
  const topTrack = inProgressTracks[0]

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff9100] to-[#f25c05] p-6 shadow-sm text-white space-y-5">
      {/* Glow decorativo de fundo */}
      <div
        className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />

      <div className="flex items-center gap-2">
        <Icon
          icon="lucide:star"
          width={20}
          height={20}
          className="text-white fill-white/20"
        />
        <h2 className="font-display font-bold text-lg text-white tracking-tight">
          Próximos Objetivos
        </h2>
      </div>

      <div className="space-y-3 relative z-10">
        {/* Objetivo 1: Próximo Nível */}
        <div className="rounded-2xl border border-white/15 bg-white/15 p-4 space-y-2.5 backdrop-blur-xs transition-all hover:bg-white/20">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-white text-sm">
              Alcançar nível {nextLevelLabel}
            </span>
            <span className="font-mono font-bold text-white/90 text-xs">
              {xp.progressToNext}%
            </span>
          </div>

          <div
            className="h-2 w-full rounded-full bg-black/20 overflow-hidden"
            role="progressbar"
            aria-valuenow={xp.progressToNext}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-white transition-all shadow-xs"
              style={{ width: `${xp.progressToNext}%` }}
            />
          </div>

          <p className="text-white/80 text-xs">
            {xp.xpToNextLevel > 0
              ? `Faltam ${formatNumber(xp.xpToNextLevel)} XP`
              : "Nível máximo alcançado!"}
          </p>
        </div>

        {/* Objetivo 2: Meta de Ofensiva */}
        <div className="rounded-2xl border border-white/15 bg-white/15 p-4 space-y-2.5 backdrop-blur-xs transition-all hover:bg-white/20">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-white text-sm">
              {streakTarget} dias consecutivos
            </span>
            <span className="font-mono font-bold text-white/90 text-xs">
              {streak.streakCurrent}/{streakTarget}
            </span>
          </div>

          <div
            className="h-2 w-full rounded-full bg-black/20 overflow-hidden"
            role="progressbar"
            aria-valuenow={streakProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-white transition-all shadow-xs"
              style={{ width: `${streakProgress}%` }}
            />
          </div>

          <p className="text-white/80 text-xs">
            {streakRemaining > 0
              ? `Faltam ${streakRemaining} ${streakRemaining === 1 ? "dia" : "dias"}`
              : "Meta diária concluída!"}
          </p>
        </div>

        {/* Objetivo 3: Conclusão de Trilha / Cursos */}
        <div className="rounded-2xl border border-white/15 bg-white/15 p-4 space-y-2.5 backdrop-blur-xs transition-all hover:bg-white/20">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-white text-sm truncate">
              {topTrack
                ? topTrack.trackTitle
                : `Completar ${tracksTarget} cursos`}
            </span>
            <span className="font-mono font-bold text-white/90 text-xs">
              {topTrack
                ? `${topTrack.progressPercentage}%`
                : `${stats.completedTracksCount}/${tracksTarget}`}
            </span>
          </div>

          <div
            className="h-2 w-full rounded-full bg-black/20 overflow-hidden"
            role="progressbar"
            aria-valuenow={
              topTrack
                ? topTrack.progressPercentage
                : (stats.completedTracksCount / tracksTarget) * 100
            }
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-white transition-all shadow-xs"
              style={{
                width: `${topTrack ? topTrack.progressPercentage : Math.min(Math.round((stats.completedTracksCount / tracksTarget) * 100), 100)}%`,
              }}
            />
          </div>

          <p className="text-white/80 text-xs truncate">
            {topTrack
              ? `Faltam ${topTrack.totalLessons - topTrack.completedLessons} lições para concluir`
              : `Faltam ${tracksRemaining} ${tracksRemaining === 1 ? "curso" : "cursos"}`}
          </p>
        </div>
      </div>
    </div>
  )
}
