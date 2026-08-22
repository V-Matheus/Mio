import type { Metadata } from "next"
import { ProfileView } from "@/modules/profile"

export const metadata: Metadata = {
  title: "Meu Perfil | Mio",
  description:
    "Visualize seu progresso, conquistas e histórico de aprendizado.",
}

export default async function PerfilPage() {
  return await ProfileView()
}
