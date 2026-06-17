import type { Metadata } from "next"
import { ForgotPasswordForm } from "./_components/forgot-password-form"
import { ForgotPasswordSidePanel } from "./_components/forgot-password-side-panel"

export const metadata: Metadata = {
  title: "Recuperar senha | Mio",
  description:
    "Esqueceu sua senha? Enviaremos um link de recuperação para o seu email.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <ForgotPasswordSidePanel />
      <ForgotPasswordForm />
    </div>
  )
}
