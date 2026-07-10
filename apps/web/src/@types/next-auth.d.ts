import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      roles?: string[]
    } & DefaultSession["user"]
  }

  interface User {
    accessToken?: string
    id?: string
    roles?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    id?: string
    roles?: string[]
  }
}
