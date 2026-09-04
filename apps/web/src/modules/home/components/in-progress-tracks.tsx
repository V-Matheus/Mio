import Link from "next/link"
import type { HomeTrackProgress } from "@/modules/home/types"
import { Icon } from "@/shared/components/icon"
import { InProgressCard } from "./in-progress-card"

interface InProgressTracksProps {
  tracks: HomeTrackProgress[]
}

export function InProgressTracks({ tracks }: InProgressTracksProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground tracking-tight sm:text-2xl">
          Cursos em Andamento
        </h2>
        <Link
          href="/trilhas"
          className="inline-flex items-center gap-1 font-semibold text-primary text-sm hover:underline"
        >
          Ver todos
          <Icon icon="lucide:arrow-right" width={16} height={16} />
        </Link>
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Icon icon="lucide:compass" width={24} height={24} />
          </div>
          <p className="font-semibold text-foreground text-base">
            Nenhum curso em andamento
          </p>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1 mb-4 max-w-sm">
            Você ainda não iniciou nenhuma trilha. Explore nosso catálogo e dê
            seu primeiro passo no aprendizado!
          </p>
          <Link
            href="/trilhas"
            className="rounded-full bg-primary px-6 py-2.5 font-display font-bold text-xs text-white shadow-sm hover:bg-primary-hover transition-colors"
          >
            Explorar Trilhas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track, idx) => (
            <InProgressCard key={track.trackId} track={track} index={idx} />
          ))}
        </div>
      )}
    </section>
  )
}
