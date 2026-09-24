import type { Metadata } from "next"
import { ResetPasswordView } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Redefinir senha | Mio",
  description:
    "Crie uma nova senha para recuperar o acesso à sua conta na plataforma Mio.",
}

interface ResetPasswordPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params

  return <ResetPasswordView token={token} />
}
