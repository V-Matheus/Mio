import NextAuth, { type NextAuthResult } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { authService } from "./lib/auth/service"

const nextAuth = NextAuth({
  providers: [
    Google,
    GitHub,
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          return null
        }

        const loginResult = await authService.login({ email, password })
        if (!loginResult.ok) {
          return null
        }

        const meResult = await authService.me(loginResult.accessToken)
        if (!meResult.ok) {
          return null
        }

        return {
          id: meResult.user.code,
          name: meResult.user.name,
          email: meResult.user.email,
          image: meResult.user.avatarUrl,
          accessToken: loginResult.accessToken,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") {
        return true
      }

      if (account.provider !== "google" && account.provider !== "github") {
        return false
      }

      if (!user.email) {
        return false
      }

      const upsertResult = await authService.upsertOAuthUser({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        email: user.email,
        name: user.name ?? "",
        avatarUrl: user.image ?? null,
      })

      if (!upsertResult.ok) {
        return false
      }

      const meResult = await authService.me(upsertResult.accessToken)
      if (!meResult.ok) {
        return false
      }

      user.id = meResult.user.code
      user.name = meResult.user.name
      user.email = meResult.user.email
      user.image = meResult.user.avatarUrl
      user.accessToken = upsertResult.accessToken

      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.accessToken = user.accessToken
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        return token
      }

      if (trigger === "update" && token.accessToken) {
        const meResult = await authService.me(token.accessToken as string)
        if (meResult.ok) {
          token.id = meResult.user.code
          token.name = meResult.user.name
          token.email = meResult.user.email
          token.picture = meResult.user.avatarUrl
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken

      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string)
        session.user.name = token.name || null
        session.user.email = (token.email as string) || ""
        session.user.image = (token.picture as string | null) ?? null
      }

      return session
    },
  },
})

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut
export const auth: NextAuthResult["auth"] = nextAuth.auth
