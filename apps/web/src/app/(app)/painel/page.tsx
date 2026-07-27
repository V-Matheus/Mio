import { authService } from "@/lib/auth/service"
import { PainelDashboardClient } from "./_components/painel-dashboard-client"

export default async function PainelPage() {
  const result = await authService.listUsers()
  const initialUsers = result.ok ? result.users : []

  return <PainelDashboardClient initialUsers={initialUsers} />
}
