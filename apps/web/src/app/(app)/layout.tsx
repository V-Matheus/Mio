import type { ReactNode } from "react"
import { getSessionUser } from "@/modules/auth/utils/getSessionUser"
import { AppShell } from "@/shared/components/layout"

export default async function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getSessionUser()

  return <AppShell user={user}>{children}</AppShell>
}
