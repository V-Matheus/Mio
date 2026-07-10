import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { authService } from "@/lib/auth/service"
import { AdminDashboardClient } from "./AdminDashboardClient"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.accessToken || !session.user?.roles?.includes("ADMIN")) {
    redirect("/home")
  }

  const result = await authService.listUsers(session.accessToken)
  const initialUsers = result.ok ? result.users : []

  return <AdminDashboardClient initialUsers={initialUsers} />
}
