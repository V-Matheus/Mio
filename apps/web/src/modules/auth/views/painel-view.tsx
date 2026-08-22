import { PainelDashboardClient } from "@/modules/auth/components/painel-dashboard-client"
import { listUsersQuery } from "@/modules/auth/queries/list-users"

export async function PainelView() {
  const result = await listUsersQuery()
  const initialUsers = result.ok ? result.users : []

  return <PainelDashboardClient initialUsers={initialUsers} />
}
