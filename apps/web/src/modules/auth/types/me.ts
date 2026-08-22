export type MeUser = {
  code: string
  email: string
  name: string
  avatarUrl: string | null
  roles: string[]
}

export type MeResult = { ok: true; user: MeUser } | { ok: false; error: string }
