import "server-only"

import { redirect } from "next/navigation"
import { auth } from "@/auth"

/**
 * Usuário da sessão NextAuth, normalizado para os campos que vêm de `/me`
 * (`code` é exposto como `id`). Inclui a role primária e o accessToken.
 */
export type SessionUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  roles: string[]
  role: string
  accessToken: string
}

/**
 * Lê o usuário autenticado da sessão NextAuth.
 *
 * Por padrão (`require: true`) redireciona para `/login` quando não há sessão ou accessToken
 * e devolve um `SessionUser` completo não-nulo. Passe `require: false` para apenas obter
 * o usuário (ou `null`) sem redirecionar.
 */
export async function getSessionUser(options?: {
  require?: true
}): Promise<SessionUser>
export async function getSessionUser(options: {
  require: false
}): Promise<SessionUser | null>
export async function getSessionUser(options?: {
  require?: boolean
}): Promise<SessionUser | null> {
  const session = await auth()

  const userRoles = session?.user?.roles || []
  const priorityRole = userRoles.includes("ADMIN")
    ? "ADMIN"
    : userRoles.includes("TEACHER")
      ? "TEACHER"
      : "STUDENT"

  const user: SessionUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
        roles: userRoles,
        role: priorityRole,
        accessToken: session.accessToken ?? "",
      }
    : null

  if (!user?.accessToken && (options?.require ?? true)) {
    redirect("/login")
  }

  return user
}

export const requireAuthSession = getSessionUser
