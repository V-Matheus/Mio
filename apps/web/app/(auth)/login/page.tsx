import type { Metadata } from "next"
import { LoginForm } from "./_components/login-form"
import { LoginSidePanel } from "./_components/login-side-panel"

export const metadata: Metadata = {
  title: "Login | Mio",
  description: "Entre na sua conta para continuar sua jornada de aprendizado.",
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <LoginSidePanel />
      <LoginForm />
    </div>
  )
}
