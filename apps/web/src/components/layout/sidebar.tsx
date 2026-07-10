"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@/components/icon"
import type { SessionUser } from "@/lib/auth/utils/getSessionUser"
import { navItems } from "./nav-items"
import { SidebarUser } from "./sidebar-user"

interface SidebarProps {
  user: SessionUser
  /** Aberta como drawer no mobile; fixa no desktop. */
  open?: boolean
  onNavigate?: () => void
}

export function Sidebar({ user, open = false, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop do drawer mobile */}
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onNavigate}
        className={`fixed inset-0 z-30 bg-foreground/40 md:hidden ${
          open ? "block" : "hidden"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-100 bg-white transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-zinc-100 px-3">
          <Link href="/home" onClick={onNavigate} className="px-3">
            <Image
              src="/logo-mio.png"
              alt="Mio"
              width={89}
              height={35}
              priority
            />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems
            .filter((item) => {
              if (!item.roles) return true
              return (user.roles || []).some((r) => item.roles?.includes(r))
            })
            .map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              const classes = [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                item.disabled
                  ? "pointer-events-none opacity-50 text-foreground/40"
                  : isActive
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/70 hover:bg-background hover:text-primary",
              ].join(" ")

              return (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  onClick={item.disabled ? undefined : onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={classes}
                >
                  <Icon icon={item.icon} width={20} height={20} />
                  {item.label}
                </Link>
              )
            })}
        </nav>

        <SidebarUser user={user} />
      </aside>
    </>
  )
}
