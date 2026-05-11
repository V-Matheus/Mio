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

        const result = await authService.login({ email, password })

        if (result.ok) {
          return {
            accessToken: result.accessToken,
            email,
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[auth] sign-in", {
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        profile,
      })
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken

      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string)
        session.user.name = token.name || null
        session.user.email = (token.email as string) || ""
      }

      return session
    },
  },
})

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn
export const auth: NextAuthResult["auth"] = nextAuth.auth
