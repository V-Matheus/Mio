"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { AvatarImage, AvatarWrapper } from "@/components/avatar"
import { ButtonWrapper } from "@/components/button"
import { CardWrapper } from "@/components/card/card-wrapper"
import { Icon } from "@/components/icon"
import { InputControl, InputField } from "@/components/input"
import { updateUserRoleAction } from "@/lib/auth/actions"
import type { MeUser } from "@/lib/auth/types"

interface PainelDashboardClientProps {
  initialUsers: MeUser[]
}

export function PainelDashboardClient({
  initialUsers,
}: PainelDashboardClientProps) {
  const [users, setUsers] = useState<MeUser[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [updatingCode, setUpdatingCode] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const firstItemRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null)
      }
    }

    if (activeDropdown) {
      document.addEventListener("keydown", handleKeyDown)
      const focusTimeout = setTimeout(() => {
        firstItemRef.current?.focus()
      }, 0)

      return () => {
        document.removeEventListener("keydown", handleKeyDown)
        clearTimeout(focusTimeout)
      }
    }
  }, [activeDropdown])

  useEffect(() => {
    if (!activeDropdown && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [activeDropdown])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = search.toLowerCase()
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    })
  }, [users, search])

  const handleRoleUpdate = (
    userCode: string,
    newRole: "ADMIN" | "TEACHER" | "STUDENT",
  ) => {
    setActiveDropdown(null)
    setUpdatingCode(userCode)
    setError(null)

    startTransition(async () => {
      const res = await updateUserRoleAction(userCode, newRole)
      setUpdatingCode(null)

      if (!res.ok) {
        setError(
          res.error || "Ocorreu um erro ao atualizar o perfil de acesso.",
        )
        return
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.code === userCode ? { ...user, roles: [newRole] } : user,
        ),
      )
    })
  }

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("ADMIN")) {
      return {
        label: "Administrador",
        classes: "bg-red-50 text-red-600 border border-red-100",
      }
    }
    if (roles.includes("TEACHER")) {
      return {
        label: "Professor",
        classes: "bg-primary/10 text-primary border border-primary/20",
      }
    }
    return {
      label: "Aluno",
      classes: "bg-success/10 text-success border border-success/20",
    }
  }

  const getMockXp = (name: string) => {
    if (name.includes("Ana")) return "15000 XP"
    if (name.includes("Carlos")) return "8400 XP"
    if (name.includes("Marina")) return "1200 XP"
    if (name.includes("João")) return "450 XP"
    return "0 XP"
  }

  const getStatusBadge = (name: string) => {
    const isBlocked = name.toLowerCase().includes("troll")
    if (isBlocked) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-100">
          <span className="size-1.5 rounded-full bg-red-500" />
          Bloqueado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success border border-success/20">
        <span className="size-1.5 rounded-full bg-success" />
        Ativo
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
            <Icon icon="lucide:shield-alert" className="size-6" />
          </span>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-1">
            <span>Painel Geral</span>
          </h1>
        </div>
        <p className="text-foreground/60 text-sm font-medium">
          Gerencie os usuários e os níveis de permissão da plataforma.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          <Icon icon="lucide:shield-alert" className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <CardWrapper className="p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-foreground/10">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-display font-bold text-foreground">
              Usuários
            </h2>
            <p className="text-foreground/40 text-xs font-medium">
              Gerencie quem tem acesso ao Estúdio e permissões administrativas.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <InputField>
              <Icon
                icon="lucide:search"
                className="size-4 text-foreground/40 shrink-0"
              />
              <InputControl
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputField>
          </div>
        </div>

        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-foreground/10 text-xxs font-bold uppercase tracking-wider text-foreground/40 bg-foreground/5">
                <th className="pb-3.5 pt-4 px-6">Usuário</th>
                <th className="pb-3.5 pt-4 px-6">Email</th>
                <th className="pb-3.5 pt-4 px-6">Nível de Acesso</th>
                <th className="pb-3.5 pt-4 px-6">Status</th>
                <th className="pb-3.5 pt-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-foreground/40 font-medium"
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleInfo = getRoleBadge(user.roles)
                  const isUpdating = updatingCode === user.code

                  return (
                    <tr
                      key={user.code}
                      className="hover:bg-foreground/5 transition-colors group"
                    >
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <AvatarWrapper
                            size="md"
                            className="ring-2 ring-foreground/5"
                          >
                            <AvatarImage
                              src={user.avatarUrl}
                              name={user.name}
                            />
                          </AvatarWrapper>
                          <div>
                            <div className="font-semibold text-foreground">
                              {user.name}
                            </div>
                            <div className="text-xxs font-bold text-foreground/40 uppercase tracking-wider">
                              {getMockXp(user.name)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-6 text-foreground/60 font-medium">
                        {user.email}
                      </td>

                      <td className="py-4.5 px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${roleInfo.classes}`}
                        >
                          {roleInfo.label}
                        </span>
                      </td>

                      <td className="py-4.5 px-6">
                        {getStatusBadge(user.name)}
                      </td>

                      <td className="py-4.5 px-6 text-right relative">
                        {isUpdating ? (
                          <div className="inline-flex items-center justify-center size-8">
                            <Icon
                              icon="mdi:update"
                              className="size-4.5 animate-spin text-primary"
                            />
                          </div>
                        ) : (
                          <div className="inline-block text-left">
                            <ButtonWrapper
                              variant="secondary"
                              type="button"
                              onClick={(e) => {
                                triggerRef.current = e.currentTarget
                                setActiveDropdown(
                                  activeDropdown === user.code
                                    ? null
                                    : user.code,
                                )
                              }}
                              className="p-2! border-0!"
                              aria-label="Ações do usuário"
                            >
                              <Icon
                                icon="lucide:more-vertical"
                                className="size-4.5 text-foreground"
                              />
                            </ButtonWrapper>

                            {activeDropdown === user.code && (
                              <>
                                <button
                                  type="button"
                                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                                  onClick={() => setActiveDropdown(null)}
                                  aria-label="Fechar menu"
                                />
                                <div className="absolute right-6 mt-1 z-50 w-48 rounded-2xl border border-foreground/10 bg-white p-1.5 shadow-xl outline-none animate-in fade-in slide-in-from-top-1 duration-100">
                                  <button
                                    ref={firstItemRef}
                                    type="button"
                                    onClick={() =>
                                      handleRoleUpdate(user.code, "ADMIN")
                                    }
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Icon
                                      icon="mdi:shield-star"
                                      className="size-4"
                                    />
                                    Tornar Admin
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleUpdate(user.code, "TEACHER")
                                    }
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  >
                                    <Icon
                                      icon="lucide:feather"
                                      className="size-4"
                                    />
                                    Tornar Professor
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleUpdate(user.code, "STUDENT")
                                    }
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-success hover:bg-success/10 transition-colors cursor-pointer"
                                  >
                                    <Icon
                                      icon="lucide:user"
                                      className="size-4"
                                    />
                                    Tornar Aluno
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardWrapper>
    </div>
  )
}
