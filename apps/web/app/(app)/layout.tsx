import type { ReactNode } from "react"
import { AppShell } from "@/app/components/layout"
import { getSessionUser } from "@/lib/auth/utils/getSessionUser"

export default async function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getSessionUser()

  return <AppShell user={user}>{children}</AppShell>
}
