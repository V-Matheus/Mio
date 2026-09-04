import {
  HomeHeader,
  HomeStats,
  InProgressTracks,
  NextSteps,
  RecentActivities,
} from "@/modules/home/components"
import { getHomeQuery } from "@/modules/home/queries"

export async function HomeView() {
  const homeData = await getHomeQuery()

  if (!homeData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="font-semibold text-foreground text-lg">
          Não foi possível carregar as informações do seu painel.
        </p>
        <p className="text-foreground/50 text-sm mt-1">
          Tente recarregar a página ou faça login novamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Saudação do Usuário */}
      <HomeHeader user={homeData.user} />

      {/* 2. Cards de Estatísticas Rápidas (Sequência, XP Total, Aulas) */}
      <HomeStats
        streak={homeData.streak}
        xp={homeData.xp}
        stats={homeData.stats}
      />

      {/* 3. Cursos em Andamento */}
      <InProgressTracks tracks={homeData.inProgressTracks} />

      {/* 4. Grid Inferior com Atividades Recentes e Próximos Passos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivities
            activities={homeData.recentActivities}
            streak={homeData.streak}
          />
        </div>

        <div className="lg:col-span-1">
          <NextSteps inProgressTracks={homeData.inProgressTracks} />
        </div>
      </div>
    </div>
  )
}
