import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form"
import { ResetPasswordSidePanel } from "@/modules/auth/components/reset-password-side-panel"

interface ResetPasswordViewProps {
  token: string
}

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <ResetPasswordSidePanel />
      <ResetPasswordForm token={token} />
    </div>
  )
}
