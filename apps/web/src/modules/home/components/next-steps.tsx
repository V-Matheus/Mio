import Link from "next/link"
import type { HomeTrackProgress } from "@/modules/home/types"
import { CardWrapper } from "@/shared/components/card"
import { Icon } from "@/shared/components/icon"

interface NextStepsProps {
  inProgressTracks: HomeTrackProgress[]
}

export function NextSteps({ inProgressTracks }: NextStepsProps) {
  const nextTrack =
    inProgressTracks.find((t) => t.currentLessonSlug) ?? inProgressTracks[0]

  return (
    <CardWrapper className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <Icon
          icon="lucide:target"
          width={20}
          height={20}
          className="text-primary"
        />
        <h2 className="font-display font-bold text-lg text-foreground tracking-tight sm:text-xl">
          Próximos Passos
        </h2>
      </div>

      <div className="space-y-3">
        {/* Card 1: Próxima Aula */}
        {nextTrack ? (
          <Link
            href={
              nextTrack.currentLessonSlug
                ? `/trilhas/${nextTrack.trackSlug}/aula/${nextTrack.currentLessonSlug}`
                : `/trilhas/${nextTrack.trackSlug}`
            }
            className="group block rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 dark:bg-orange-500/10"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
              <Icon icon="lucide:book-open" width={16} height={16} />
              <span>Próxima Aula</span>
            </div>
            <p className="mt-1.5 font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
              {nextTrack.currentLessonTitle ?? "Continuar Trilha"}
            </p>
            <p className="text-xs text-foreground/60 line-clamp-1">
              {nextTrack.trackTitle}
            </p>
          </Link>
        ) : (
          <Link
            href="/trilhas"
            className="group block rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 dark:bg-orange-500/10"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
              <Icon icon="lucide:book-open" width={16} height={16} />
              <span>Começar a Estudar</span>
            </div>
            <p className="mt-1.5 font-bold text-foreground text-sm group-hover:text-primary transition-colors">
              Escolha sua primeira trilha
            </p>
            <p className="text-xs text-foreground/60">
              Explore o catálogo completo de cursos
            </p>
          </Link>
        )}

        {/* Card 2: Desafio Diário */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Icon icon="lucide:target" width={16} height={16} />
            <span>Desafio Diário</span>
          </div>
          <p className="mt-1.5 font-bold text-foreground text-sm">
            Complete 1 aula hoje
          </p>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
            +50 XP de bônus
          </p>
        </div>

        {/* Card 3: Recomendado */}
        <Link
          href="/trilhas"
          className="group block rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 dark:bg-indigo-500/10"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Icon icon="lucide:lightbulb" width={16} height={16} />
            <span>Recomendado</span>
          </div>
          <p className="mt-1.5 font-bold text-foreground text-sm group-hover:text-primary transition-colors">
            Descubra novas tecnologias
          </p>
          <p className="text-xs text-foreground/60">
            Aprenda Front-End, Back-End e mais
          </p>
        </Link>
      </div>
    </CardWrapper>
  )
}
