import type { Metadata } from "next"
import { RegisterForm } from "./_components/register-form"
import { RegisterSidePanel } from "./_components/register-side-panel"

export const metadata: Metadata = {
  title: "Cadastro | Mio",
  description: "Crie sua conta e comece sua jornada de aprendizado com o Mio.",
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <RegisterSidePanel />
      <RegisterForm />
    </div>
  )
}
