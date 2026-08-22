import {
  LEVEL_METADATA,
  type LeaderboardEntry,
} from "@/modules/gamification/types"
import { AvatarImage, AvatarWrapper } from "@/shared/components/avatar"
import { Icon } from "@/shared/components/icon"

interface LeaderboardListProps {
  entries: LeaderboardEntry[]
  currentUserCode?: string
}

export function LeaderboardList({
  entries,
  currentUserCode,
}: LeaderboardListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 p-12 text-center">
        <Icon
          icon="lucide:trophy"
          width={48}
          height={48}
          className="text-zinc-300"
        />
        <h3 className="mt-4 font-display text-lg font-bold text-foreground">
          Nenhum aluno no ranking ainda
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Complete aulas para acumular XP e ser o primeiro classificado!
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-xs">
      <div className="divide-y divide-zinc-100">
        {entries.map((entry) => {
          const isCurrentUser =
            currentUserCode && entry.userCode === currentUserCode
          const meta = LEVEL_METADATA[entry.level] ?? LEVEL_METADATA.LEIGO
          const formattedXp = new Intl.NumberFormat("pt-BR").format(entry.total)

          return (
            <div
              key={entry.userCode}
              className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-zinc-50/80 ${
                isCurrentUser
                  ? "bg-primary/5 ring-1 ring-inset ring-primary/20"
                  : ""
              }`}
            >
              {/* Posição no ranking */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center font-display font-bold text-sm">
                {entry.rank === 1 ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    🥇
                  </span>
                ) : entry.rank === 2 ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                    🥈
                  </span>
                ) : entry.rank === 3 ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-amber-900 border border-orange-300">
                    🥉
                  </span>
                ) : (
                  <span className="text-zinc-400">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <AvatarWrapper size="md" className="shrink-0">
                <AvatarImage
                  src={entry.avatarUrl ?? undefined}
                  name={entry.name}
                />
              </AvatarWrapper>

              {/* Nome e Nível */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display font-bold text-foreground text-sm">
                    {entry.name}
                  </p>
                  {isCurrentUser && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      Você
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[11px] font-medium ${meta?.badgeClass}`}
                  >
                    <Icon
                      icon={meta?.icon ?? "lucide:award"}
                      width={12}
                      height={12}
                    />
                    {meta?.label}
                  </span>
                </div>
              </div>

              {/* Pontuação */}
              <div className="shrink-0 text-right">
                <div className="inline-flex items-center gap-1 font-display font-bold text-foreground text-sm sm:text-base">
                  <Icon
                    icon="lucide:zap"
                    width={16}
                    height={16}
                    className="text-amber-500 fill-amber-500"
                  />
                  <span>{formattedXp}</span>
                  <span className="text-xs font-medium text-zinc-400">XP</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
