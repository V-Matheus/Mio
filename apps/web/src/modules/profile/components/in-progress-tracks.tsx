import Link from "next/link"
import type { TrackProgressSummary } from "@/modules/profile/types"
import { ButtonWrapper } from "@/shared/components/button"
import { CardWrapper } from "@/shared/components/card"
import { Icon } from "@/shared/components/icon"
import { ProgressBar } from "@/shared/components/progress-bar"

interface InProgressTracksProps {
  tracks: TrackProgressSummary[]
}

export function InProgressTracks({ tracks }: InProgressTracksProps) {
  return (
    <CardWrapper className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            icon="lucide:target"
            width={18}
            height={18}
            className="text-primary"
          />
          <h2 className="font-display font-bold text-lg text-foreground tracking-tight">
            Cursos em Andamento
          </h2>
        </div>

        <Link
          href="/trilhas"
          className="inline-flex items-center gap-1 font-semibold text-primary text-xs hover:underline"
        >
          Ver todos os cursos
          <Icon icon="lucide:arrow-right" width={14} height={14} />
        </Link>
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-foreground/40 mb-3">
            <Icon icon="lucide:compass" width={24} height={24} />
          </div>
          <p className="font-medium text-foreground text-sm">
            Nenhum curso em andamento
          </p>
          <p className="text-foreground/50 text-xs mt-1 mb-4 max-w-xs">
            Você ainda não iniciou nenhuma trilha. Explore nosso catálogo e
            comece a evoluir suas habilidades!
          </p>
          <Link href="/trilhas">
            <ButtonWrapper
              variant="primary"
              className="px-6 py-2.5 text-xs shadow-none hover:shadow-xs"
            >
              Explorar Trilhas
            </ButtonWrapper>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => (
            <div
              key={track.trackId}
              className="group flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4.5 transition-all hover:border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    {track.trackTitle}
                  </h3>
                  <span className="font-mono font-bold text-primary text-xs">
                    {track.progressPercentage}%
                  </span>
                </div>

                {/* Barra de Progresso do Curso */}
                <ProgressBar
                  value={track.progressPercentage}
                  max={100}
                  className="h-2 bg-zinc-200"
                />

                <div className="flex items-center justify-between text-foreground/50 text-xs">
                  <span className="truncate">
                    {track.currentLessonTitle
                      ? `Próxima: ${track.currentLessonTitle}`
                      : `${track.completedLessons} de ${track.totalLessons} lições`}
                  </span>
                  <span className="shrink-0 font-mono">
                    {track.completedLessons}/{track.totalLessons}
                  </span>
                </div>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0 sm:pl-4">
                <Link
                  href={
                    track.currentLessonSlug
                      ? `/trilhas/${track.trackSlug}/aula/${track.currentLessonSlug}`
                      : `/trilhas/${track.trackSlug}`
                  }
                >
                  <ButtonWrapper
                    variant="secondary"
                    className="w-full gap-1.5 px-5 py-2 text-xs sm:w-auto shadow-none"
                  >
                    Continuar
                    <Icon icon="lucide:play" width={12} height={12} />
                  </ButtonWrapper>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardWrapper>
  )
}
