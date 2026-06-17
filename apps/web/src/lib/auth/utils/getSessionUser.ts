import "server-only"

import { redirect } from "next/navigation"
import { auth } from "@/auth"

/**
 * Usuário da sessão NextAuth, normalizado para os campos que vêm de `/me`
 * (`code` é exposto como `id`). Use em Server Components do shell autenticado.
 */
export type SessionUser = {
  id: string
  name: string | null
  email: string
  image: string | null
}

/**
 * Lê o usuário autenticado da sessão NextAuth.
 *
 * Por padrão (`require: true`) redireciona para `/login` quando não há sessão e
 * devolve um `SessionUser` não-nulo — evitando repetir o guard
 * `if (!user) redirect(...)` em cada Server Component. Passe `require: false`
 * para apenas obter o usuário (ou `null`) sem redirecionar.
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

  const user: SessionUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null

  if (!user && (options?.require ?? true)) {
    redirect("/login")
  }

  return user
}
