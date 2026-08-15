import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
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
    accessTokenExpires?: number
    error?: string
    id?: string
    roles?: string[]
  }
}
