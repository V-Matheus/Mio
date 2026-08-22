import type { Metadata } from "next"
import { RankingView } from "@/modules/gamification"

export const metadata: Metadata = {
  title: "Ranking Global | Mio",
  description:
    "Acompanhe sua posição e dispute o topo do ranking global de XP do Mio.",
}

export default async function RankingPage() {
  return await RankingView()
}
