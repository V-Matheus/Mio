import {
  InProgressTracks,
  NextGoals,
  ProfileHeader,
  QuickStats,
  RecentActivityList,
  WeeklyActivity,
} from "@/modules/profile/components"
import { getProfileQuery } from "@/modules/profile/queries/profile"

export async function ProfileView() {
  const profile = await getProfileQuery()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="font-semibold text-foreground text-lg">
          Não foi possível carregar as informações do seu perfil.
        </p>
        <p className="text-foreground/50 text-sm mt-1">
          Tente recarregar a página ou faça login novamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho do Perfil (Avatar, Nível, XP, Mascote) */}
      <ProfileHeader profile={profile} />

      {/* Métricas Rápidas (Streak, Cursos, Lições) */}
      <QuickStats profile={profile} />

      {/* Grid Principal de Conteúdo */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna Principal (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <WeeklyActivity weeklyXp={profile.weeklyXp} />
          <InProgressTracks tracks={profile.inProgressTracks} />
          <RecentActivityList activities={profile.recentActivities} />
        </div>

        {/* Coluna Lateral (1/3) */}
        <div className="space-y-6">
          <NextGoals profile={profile} />
        </div>
      </div>
    </div>
  )
}
