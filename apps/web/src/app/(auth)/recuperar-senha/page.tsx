import type { Metadata } from "next"
import { ForgotPasswordView } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Recuperar senha | Mio",
  description:
    "Esqueceu sua senha? Enviaremos um link de recuperação para o seu email.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}
