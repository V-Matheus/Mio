import { LoginForm } from "@/modules/auth/components/login-form"
import { LoginSidePanel } from "@/modules/auth/components/login-side-panel"

export function LoginView() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <LoginSidePanel />
      <LoginForm />
    </div>
  )
}
