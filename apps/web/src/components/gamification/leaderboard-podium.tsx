import { AvatarImage, AvatarWrapper } from "@/components/avatar"
import { Icon } from "@/components/icon"
import { LEVEL_METADATA, type LeaderboardEntry } from "@/lib/gamification/types"

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[]
}

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null

  const first = entries.find((e) => e.rank === 1)
  const second = entries.find((e) => e.rank === 2)
  const third = entries.find((e) => e.rank === 3)

  return (
    <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3 sm:items-end">
      {/* 2º Lugar - Prata */}
      {second && (
        <div className="order-2 flex flex-col items-center sm:order-1">
          <div className="relative mb-3 flex flex-col items-center">
            <div className="relative">
              <AvatarWrapper
                size="lg"
                className="ring-4 ring-slate-300 shadow-md"
              >
                <AvatarImage
                  src={second.avatarUrl ?? undefined}
                  name={second.name}
                />
              </AvatarWrapper>
              <span className="absolute -bottom-2.5 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 border-2 border-white text-xs font-black text-slate-700 shadow">
                2
              </span>
            </div>
            <p className="mt-4 font-display font-bold text-foreground truncate max-w-[140px] text-center">
              {second.name}
            </p>
            <span className="mt-0.5 text-xs font-semibold text-zinc-500">
              {LEVEL_METADATA[second.level]?.label ?? second.level}
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-black font-display text-slate-700">
              <Icon
                icon="lucide:zap"
                width={14}
                height={14}
                className="text-amber-500 fill-amber-500"
              />
              {new Intl.NumberFormat("pt-BR").format(second.total)} XP
            </span>
          </div>

          <div className="flex h-28 w-full flex-col items-center justify-center rounded-t-2xl border border-b-0 border-slate-200 bg-gradient-to-t from-slate-100 to-white/60 p-4 shadow-2xs">
            <Icon
              icon="lucide:medal"
              width={28}
              height={28}
              className="text-slate-400"
            />
            <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600">
              2º Lugar
            </span>
          </div>
        </div>
      )}

      {/* 1º Lugar - Ouro */}
      {first && (
        <div className="order-1 flex flex-col items-center sm:order-2">
          <div className="relative mb-3 flex flex-col items-center">
            <div className="relative">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce text-amber-500">
                <Icon
                  icon="lucide:crown"
                  width={28}
                  height={28}
                  className="fill-amber-400"
                />
              </span>
              <AvatarWrapper
                size="xl"
                className="ring-4 ring-amber-400 shadow-xl"
              >
                <AvatarImage
                  src={first.avatarUrl ?? undefined}
                  name={first.name}
                />
              </AvatarWrapper>
              <span className="absolute -bottom-3 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 border-2 border-white text-xs font-black text-amber-950 shadow-md">
                1
              </span>
            </div>
            <p className="mt-4 font-display font-bold text-foreground text-lg truncate max-w-[160px] text-center">
              {first.name}
            </p>
            <span className="mt-0.5 text-xs font-bold text-amber-600">
              {LEVEL_METADATA[first.level]?.label ?? first.level}
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-base font-black font-display text-amber-600">
              <Icon
                icon="lucide:zap"
                width={16}
                height={16}
                className="text-amber-500 fill-amber-500"
              />
              {new Intl.NumberFormat("pt-BR").format(first.total)} XP
            </span>
          </div>

          <div className="flex h-36 w-full flex-col items-center justify-center rounded-t-2xl border border-b-0 border-amber-200 bg-gradient-to-t from-amber-100/80 via-amber-50/40 to-white/60 p-4 shadow-sm">
            <Icon
              icon="lucide:trophy"
              width={32}
              height={32}
              className="text-amber-500"
            />
            <span className="mt-1 text-xs font-black uppercase tracking-wider text-amber-800">
              Campeão Global
            </span>
          </div>
        </div>
      )}

      {/* 3º Lugar - Bronze */}
      {third && (
        <div className="order-3 flex flex-col items-center">
          <div className="relative mb-3 flex flex-col items-center">
            <div className="relative">
              <AvatarWrapper
                size="lg"
                className="ring-4 ring-amber-700/40 shadow-md"
              >
                <AvatarImage
                  src={third.avatarUrl ?? undefined}
                  name={third.name}
                />
              </AvatarWrapper>
              <span className="absolute -bottom-2.5 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 border-2 border-white text-xs font-black text-white shadow">
                3
              </span>
            </div>
            <p className="mt-4 font-display font-bold text-foreground truncate max-w-[140px] text-center">
              {third.name}
            </p>
            <span className="mt-0.5 text-xs font-semibold text-zinc-500">
              {LEVEL_METADATA[third.level]?.label ?? third.level}
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-black font-display text-amber-800">
              <Icon
                icon="lucide:zap"
                width={14}
                height={14}
                className="text-amber-500 fill-amber-500"
              />
              {new Intl.NumberFormat("pt-BR").format(third.total)} XP
            </span>
          </div>

          <div className="flex h-24 w-full flex-col items-center justify-center rounded-t-2xl border border-b-0 border-orange-200 bg-gradient-to-t from-orange-100/60 to-white/60 p-4 shadow-2xs">
            <Icon
              icon="lucide:award"
              width={26}
              height={26}
              className="text-amber-700"
            />
            <span className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-900">
              3º Lugar
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
