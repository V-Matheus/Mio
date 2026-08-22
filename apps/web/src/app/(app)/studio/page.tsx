import type { Metadata } from "next"
import { StudioTracksView } from "@/modules/studio"

export const metadata: Metadata = {
  title: "Studio de Criação | Mio",
  description:
    "Gerencie e crie novas trilhas, aulas e conteúdos da plataforma.",
}

export default function StudioTracksPage() {
  return <StudioTracksView />
}
