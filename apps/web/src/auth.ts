import NextAuth, { type NextAuthResult } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

import { loginCredentialsAction, upsertOAuthAction } from "@/lib/auth/actions"
import { meQuery } from "@/lib/auth/queries"
import { authService } from "@/lib/auth/service"

function getJwtExpiry(token: string): number | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3 || !parts[1]) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8"),
    )
    return typeof payload.exp === "number" ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

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

        const loginResult = await loginCredentialsAction({ email, password })
        if (!loginResult.ok) {
          return null
        }

        const meResult = await meQuery(loginResult.accessToken)
        if (!meResult.ok) {
          return null
        }

        return {
          id: meResult.user.code,
          name: meResult.user.name,
          email: meResult.user.email,
          image: meResult.user.avatarUrl,
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
          roles: meResult.user.roles,
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

      const upsertResult = await upsertOAuthAction({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        email: user.email,
        name: user.name ?? "",
        avatarUrl: user.image ?? null,
      })

      if (!upsertResult.ok) {
        return false
      }

      const meResult = await meQuery(upsertResult.accessToken)
      if (!meResult.ok) {
        return false
      }

      user.id = meResult.user.code
      user.name = meResult.user.name
      user.email = meResult.user.email
      user.image = meResult.user.avatarUrl
      user.accessToken = upsertResult.accessToken
      user.refreshToken = upsertResult.refreshToken
      user.roles = meResult.user.roles

      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpires = user.accessToken
          ? (getJwtExpiry(user.accessToken) ?? Date.now() + 60 * 60 * 1000)
          : Date.now() + 60 * 60 * 1000
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        token.roles = user.roles
        token.error = undefined
        return token
      }

      if (trigger === "update" && token.accessToken) {
        const meResult = await meQuery(token.accessToken as string)
        if (meResult.ok) {
          token.id = meResult.user.code
          token.name = meResult.user.name
          token.email = meResult.user.email
          token.picture = meResult.user.avatarUrl
          token.roles = meResult.user.roles
        }
      }

      const expiresAt =
        (token.accessTokenExpires as number) ??
        (token.accessToken ? getJwtExpiry(token.accessToken as string) : null)

      // Se o accessToken ainda é válido com margem de segurança de 60 segundos
      if (expiresAt && Date.now() < expiresAt - 60_000) {
        return token
      }

      // Se expirou ou está para expirar, tenta renovar usando o refresh token
      if (token.refreshToken) {
        const refreshResult = await authService.refreshToken(
          token.refreshToken as string,
        )
        if (refreshResult.ok) {
          token.accessToken = refreshResult.accessToken
          token.refreshToken = refreshResult.refreshToken
          token.accessTokenExpires =
            getJwtExpiry(refreshResult.accessToken) ??
            Date.now() + 60 * 60 * 1000
          token.id = refreshResult.user.code
          token.name = refreshResult.user.name
          token.email = refreshResult.user.email
          token.picture = refreshResult.user.avatarUrl
          token.roles = refreshResult.user.roles
          token.error = undefined
          return token
        }
      }

      token.error = "RefreshTokenError"
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.error = token.error as string | undefined

      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string)
        session.user.name = token.name || null
        session.user.email = (token.email as string) || ""
        session.user.image = (token.picture as string | null) ?? null
        session.user.roles = token.roles || []
      }

      return session
    },
  },
})

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut
export const auth: NextAuthResult["auth"] = nextAuth.auth
