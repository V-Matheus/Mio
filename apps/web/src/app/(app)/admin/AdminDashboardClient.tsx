"use client"

import { useMemo, useState, useTransition } from "react"
import { AvatarImage, AvatarWrapper } from "@/components/avatar"
import { CardWrapper } from "@/components/card/card-wrapper"
import { Icon } from "@/components/icon"
import { updateUserRoleAction } from "@/lib/auth/actions"
import type { MeUser } from "@/lib/auth/types"

interface AdminDashboardClientProps {
  initialUsers: MeUser[]
}

export function AdminDashboardClient({
  initialUsers,
}: AdminDashboardClientProps) {
  const [users, setUsers] = useState<MeUser[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [updatingCode, setUpdatingCode] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Filtro de busca local instantâneo
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

      // Atualiza a lista localmente
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
        classes: "bg-rose-50 text-rose-600 border border-rose-100/50",
      }
    }
    if (roles.includes("TEACHER")) {
      return {
        label: "Professor",
        classes: "bg-blue-50 text-blue-600 border border-blue-100/50",
      }
    }
    return {
      label: "Aluno",
      classes: "bg-emerald-50 text-emerald-600 border border-emerald-100/50",
    }
  }

  // XP estático correspondente ao mockup
  const getMockXp = (name: string) => {
    if (name.includes("Ana")) return "15000 XP"
    if (name.includes("Carlos")) return "8400 XP"
    if (name.includes("Marina")) return "1200 XP"
    if (name.includes("João")) return "450 XP"
    return "0 XP"
  }

  // Status estático correspondente ao mockup (Lucas Troll bloqueado)
  const getStatusBadge = (name: string) => {
    const isBlocked = name.toLowerCase().includes("troll")
    if (isBlocked) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50/50 px-2.5 py-1 text-xs font-semibold text-rose-600 border border-rose-100/30">
          <span className="size-1.5 rounded-full bg-rose-500" />
          Bloqueado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100/30">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Ativo
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center p-2.5 bg-amber-50 text-amber-500 rounded-2xl border border-amber-100 shadow-sm shadow-amber-50/50">
            <Icon icon="lucide:shield-alert" className="size-6" />
          </span>
          <h1 className="text-3xl font-display font-black tracking-tight text-zinc-950 flex items-center gap-1">
            <span>Painel Geral</span>
          </h1>
        </div>
        <p className="text-zinc-500 text-sm font-medium">
          Gerencie os usuários e os níveis de permissão da plataforma.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600">
          <Icon icon="lucide:shield-alert" className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabela de Usuários */}
      <CardWrapper className="p-0 bg-white shadow-sm border border-zinc-100 rounded-2xl">
        {/* Topo do Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-zinc-100/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-zinc-950">Usuários</h2>
            <p className="text-zinc-400 text-xs font-medium">
              Gerencie quem tem acesso ao Estúdio e permissões administrativas.
            </p>
          </div>

          {/* Busca */}
          <div className="relative w-full max-w-xs">
            <Icon
              icon="lucide:search"
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-zinc-100 bg-zinc-50/40 pl-10 pr-4 py-2.5 text-xs text-zinc-950 placeholder-zinc-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-100/60 text-xxs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/20">
                <th className="pb-3.5 pt-4 px-6">Usuário</th>
                <th className="pb-3.5 pt-4 px-6">Email</th>
                <th className="pb-3.5 pt-4 px-6">Nível de Acesso</th>
                <th className="pb-3.5 pt-4 px-6">Status</th>
                <th className="pb-3.5 pt-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/40 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-zinc-400 font-medium"
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
                      className="hover:bg-zinc-50/10 transition-colors group"
                    >
                      {/* Usuário (Avatar + Nome + XP) */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <AvatarWrapper
                            size="md"
                            className="ring-2 ring-zinc-50"
                          >
                            <AvatarImage
                              src={user.avatarUrl}
                              name={user.name}
                            />
                          </AvatarWrapper>
                          <div>
                            <div className="font-semibold text-zinc-955">
                              {user.name}
                            </div>
                            <div className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">
                              {getMockXp(user.name)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4.5 px-6 text-zinc-500 font-medium">
                        {user.email}
                      </td>

                      {/* Nível de Acesso */}
                      <td className="py-4.5 px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${roleInfo.classes}`}
                        >
                          {roleInfo.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-6">
                        {getStatusBadge(user.name)}
                      </td>

                      {/* Ações */}
                      <td className="py-4.5 px-6 text-right relative">
                        {isUpdating ? (
                          <div className="inline-flex items-center justify-center size-8">
                            <Icon
                              icon="mdi:update"
                              className="size-4.5 animate-spin text-blue-600"
                            />
                          </div>
                        ) : (
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === user.code
                                    ? null
                                    : user.code,
                                )
                              }
                              className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-100"
                              aria-label="Ações do usuário"
                            >
                              <Icon
                                icon="lucide:more-vertical"
                                className="size-4.5"
                              />
                            </button>

                            {activeDropdown === user.code && (
                              <>
                                <button
                                  type="button"
                                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                                  onClick={() => setActiveDropdown(null)}
                                  aria-label="Fechar menu"
                                />
                                <div className="absolute right-6 mt-1 z-50 w-44 rounded-2xl border border-zinc-100 bg-white p-1.5 shadow-lg shadow-zinc-200/30 outline-none animate-in fade-in slide-in-from-top-1 duration-100">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRoleUpdate(user.code, "ADMIN")
                                    }
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
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
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
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
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
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
