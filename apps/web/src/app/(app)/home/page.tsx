import type { Metadata } from "next"
import { HomeView } from "@/modules/home"

export const metadata: Metadata = {
  title: "Início | Mio",
  description: "Continue sua jornada de aprendizado e alcance novos objetivos.",
}

export default function HomePage() {
  return <HomeView />
}
