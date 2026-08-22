import { RegisterForm } from "@/modules/auth/components/register-form"
import { RegisterSidePanel } from "@/modules/auth/components/register-side-panel"

export function RegisterView() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <RegisterSidePanel />
      <RegisterForm />
    </div>
  )
}
