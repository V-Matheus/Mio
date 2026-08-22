import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form"
import { ForgotPasswordSidePanel } from "@/modules/auth/components/forgot-password-side-panel"

export function ForgotPasswordView() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <ForgotPasswordSidePanel />
      <ForgotPasswordForm />
    </div>
  )
}
