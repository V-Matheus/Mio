"use client"

import { type ReactNode, useState } from "react"
import type { SessionUser } from "@/lib/auth/utils/getSessionUser"
import { Icon } from "../icon"
import { Sidebar } from "./sidebar"

interface AppShellProps {
  user: SessionUser
  children: ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar
        user={user}
        open={drawerOpen}
        onNavigate={() => setDrawerOpen(false)}
      />

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menu"
        className="fixed top-4 left-4 z-20 rounded-xl border border-zinc-100 bg-white p-2 text-foreground/70 shadow-sm transition-colors hover:bg-background md:hidden"
      >
        <Icon icon="lucide:menu" width={24} height={24} />
      </button>

      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
