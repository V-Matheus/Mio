import type { HomeUser } from "@/modules/home/types"

interface HomeHeaderProps {
  user: HomeUser
}

export function HomeHeader({ user }: HomeHeaderProps) {
  const trimmedName = user.name?.trim()
  const firstName = trimmedName ? trimmedName.split(/\s+/)[0] : "Dev"

  return (
    <div className="space-y-1">
      <h1 className="font-display font-bold text-2xl text-foreground md:text-3xl tracking-tight">
        Olá, {firstName}! 👋
      </h1>
      <p className="text-foreground/60 text-sm md:text-base">
        Continue sua jornada de aprendizado e alcance novos objetivos
      </p>
    </div>
  )
}
