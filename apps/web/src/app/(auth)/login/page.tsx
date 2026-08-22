import type { Metadata } from "next"
import { LoginView } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Login | Mio",
  description: "Entre na sua conta para continuar sua jornada de aprendizado.",
}

export default function LoginPage() {
  return <LoginView />
}
