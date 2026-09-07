import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    /** "RefreshAccessTokenError" quando o backend rejeitou access e refresh
     *  tokens: a sessão precisa ser encerrada via /api/auth/force-signout. */
    error?: string
    user: {
      id: string
      roles?: string[]
    } & DefaultSession["user"]
  }

  interface User {
    accessToken?: string
    refreshToken?: string
    id?: string
    roles?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    error?: string
    id?: string
    roles?: string[]
  }
}
