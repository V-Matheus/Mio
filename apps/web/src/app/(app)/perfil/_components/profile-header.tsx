import Image from "next/image"
import Link from "next/link"
import { AvatarFallback, AvatarImage, AvatarWrapper } from "@/components/avatar"
import { CardWrapper } from "@/components/card"
import { ProgressBar } from "@/components/gamification"
import { Icon } from "@/components/icon"
import { LEVEL_METADATA } from "@/lib/gamification/types"
import type { UserProfile } from "@/lib/profile/types"
import { formatNumber } from "@/utils"

export interface ProfileHeaderProps {
  profile: UserProfile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { user, xp } = profile

  const levelMeta = LEVEL_METADATA[xp.level] ?? LEVEL_METADATA.LEIGO
  const totalTargetXp = xp.total + xp.xpToNextLevel

  return (
    <CardWrapper className="relative overflow-hidden p-6 sm:p-8">
      {/* Glow suave no fundo próximo ao mascote */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Seção Principal: Avatar + Informações + Progresso */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar com Botão de Edição */}
          <div className="relative inline-block self-start sm:self-auto">
            <AvatarWrapper
              size="xl"
              className="size-20 sm:size-24 border-4 border-amber-100 bg-amber-50 shadow-xs"
            >
              {user.avatarUrl ? (
                <AvatarImage
                  src={user.avatarUrl}
                  name={user.name}
                  alt={user.name}
                />
              ) : (
                <AvatarFallback
                  name={user.name}
                  className="font-bold text-amber-700 text-xl sm:text-2xl"
                />
              )}
            </AvatarWrapper>

            <Link
              href="/perfil/configuracoes"
              aria-label="Editar perfil"
              className="absolute bottom-0 right-0 flex size-7 sm:size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-95 ring-2 ring-background"
            >
              <Icon icon="lucide:pencil" width={14} height={14} />
            </Link>
          </div>

          {/* Dados do Usuário & Progresso de Nível */}
          <div className="space-y-3 min-w-0">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                {user.name}
              </h1>
              {user.email && (
                <p className="text-foreground/50 text-xs sm:text-sm font-medium mt-0.5">
                  {user.email}
                </p>
              )}
            </div>

            {/* Badge de Nível e Pontuação de XP */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-2xs">
                <Icon
                  icon={levelMeta?.icon ?? "lucide:graduation-cap"}
                  width={14}
                  height={14}
                  className="shrink-0"
                />
                Nível {levelMeta?.label ?? xp.level}
              </span>

              <span className="font-mono text-xs sm:text-sm font-medium text-foreground/70">
                <span className="font-bold text-foreground">
                  {formatNumber(xp.total)} XP
                </span>{" "}
                / {formatNumber(totalTargetXp)} XP
              </span>
            </div>

            {/* Barra de Progresso para o Próximo Nível (idêntica à barra do Ranking) */}
            <div className="w-full max-w-xs sm:max-w-md space-y-1">
              <ProgressBar
                value={xp.progressToNext}
                max={100}
                className="h-3"
              />
            </div>
          </div>
        </div>

        {/* Mascote Mio à direita */}
        <div className="relative shrink-0 hidden md:flex items-center justify-center self-center pr-4">
          <Image
            src="/mio-ok.png"
            alt="Mascote Mio"
            width={120}
            height={120}
            className="select-none object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>
      </div>
    </CardWrapper>
  )
}
