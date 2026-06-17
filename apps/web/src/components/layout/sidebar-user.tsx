"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AvatarImage, AvatarWrapper } from "@/components/avatar"
import { Icon } from "@/components/icon"
import { signOutAction } from "@/lib/auth/actions"
import type { SessionUser } from "@/lib/auth/utils/getSessionUser"

interface SidebarUserProps {
  user: SessionUser
}

/**
 * Bloco do usuário no rodapé do sidebar (avatar + nome + e-mail). Clicar abre
 * um menu acima com "Perfil" e "Sair" — não há topbar, então é aqui que mora a
 * ação de logout.
 */
export function SidebarUser({ user }: SidebarUserProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [open])

  return (
    <div ref={containerRef} className="relative border-t border-zinc-100 p-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-background"
      >
        <AvatarWrapper size="md">
          <AvatarImage src={user.image} name={user.name} />
        </AvatarWrapper>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold text-foreground text-sm">
            {user.name ?? "Usuário"}
          </p>
          <p className="truncate text-foreground/50 text-xs">{user.email}</p>
        </div>

        <Icon
          icon="lucide:chevron-up"
          width={18}
          height={18}
          className={`shrink-0 text-foreground/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-3 bottom-full left-3 mb-1 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-lg"
        >
          <Link
            href="/perfil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-foreground/80 text-sm transition-colors hover:bg-background"
          >
            <Icon icon="lucide:user" width={18} height={18} />
            Perfil
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-primary-shadow text-sm transition-colors hover:bg-background"
            >
              <Icon icon="lucide:log-out" width={18} height={18} />
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
