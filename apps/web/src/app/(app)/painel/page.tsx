import { listUsersQuery } from "@/lib/auth/queries"
import { PainelDashboardClient } from "./_components/painel-dashboard-client"

export default async function PainelPage() {
  const result = await listUsersQuery()
  const initialUsers = result.ok ? result.users : []

  return <PainelDashboardClient initialUsers={initialUsers} />
}
