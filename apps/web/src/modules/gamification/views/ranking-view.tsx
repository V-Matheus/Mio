import { getSessionUser } from "@/modules/auth/utils/getSessionUser"
import { LeaderboardList } from "@/modules/gamification/components/leaderboard-list"
import { LeaderboardPodium } from "@/modules/gamification/components/leaderboard-podium"
import { XpProgressCard } from "@/modules/gamification/components/xp-progress-card"
import {
  getLeaderboardQuery,
  getMyXpQuery,
} from "@/modules/gamification/queries"

export async function RankingView() {
  const user = await getSessionUser()
  const [myXp, leaderboard] = await Promise.all([
    getMyXpQuery(),
    getLeaderboardQuery(50, 0),
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Ranking Global
        </h1>
        <p className="text-sm text-zinc-500 sm:text-base">
          Conclua lições, ganhe pontos de experiência e avance nos níveis de
          maestria.
        </p>
      </div>

      {/* Card do Usuário Logado */}
      {myXp && (
        <section aria-labelledby="meu-desempenho">
          <h2 id="meu-desempenho" className="sr-only">
            Meu Desempenho
          </h2>
          <XpProgressCard xp={myXp} userName={user.name ?? undefined} />
        </section>
      )}

      {/* Pódio dos 3 Primeiros Colocados */}
      {leaderboard.length >= 3 && (
        <section aria-labelledby="podio-top-3" className="pt-2">
          <h2 id="podio-top-3" className="sr-only">
            Top 3 do Ranking
          </h2>
          <LeaderboardPodium entries={leaderboard.slice(0, 3)} />
        </section>
      )}

      {/* Listagem Completa do Ranking */}
      <section aria-labelledby="tabela-ranking" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            id="tabela-ranking"
            className="font-display text-xl font-bold text-foreground"
          >
            Classificação Geral
          </h2>
          <span className="text-xs font-semibold text-zinc-400">
            Top {leaderboard.length} Alunos
          </span>
        </div>

        <LeaderboardList entries={leaderboard} currentUserCode={user.id} />
      </section>
    </div>
  )
}
