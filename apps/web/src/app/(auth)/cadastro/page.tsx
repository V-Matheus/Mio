import type { Metadata } from "next"
import { RegisterView } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Cadastro | Mio",
  description: "Crie sua conta e comece sua jornada de aprendizado com o Mio.",
}

export default function RegisterPage() {
  return <RegisterView />
}
