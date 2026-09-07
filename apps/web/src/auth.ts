import NextAuth, { type NextAuthResult } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

import {
  loginCredentialsAction,
  upsertOAuthAction,
} from "@/modules/auth/actions"
import { meQuery } from "@/modules/auth/queries"
import { authService } from "@/modules/auth/services"

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
    async jwt({ token, user }) {
      if (user) {
        return {
          sub: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.image,
          roles: user.roles,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        }
      }

      if (!token.accessToken) {
        return token
      }

      // A validade do accessToken é decidida pelo backend, não por tempo calculado
      // no front. Se o backend aceitar o token, apenas sincroniza os dados do usuário.
      const meResult = await meQuery(token.accessToken as string)
      if (meResult.ok) {
        token.sub = meResult.user.code
        token.id = meResult.user.code
        token.name = meResult.user.name
        token.email = meResult.user.email
        token.picture = meResult.user.avatarUrl
        token.roles = meResult.user.roles
        token.error = undefined
        return token
      }

      // Falha indeterminada (rede, timeout, backend indisponível): não é uma
      // rejeição de autenticação. Preserva a sessão atual e tenta de novo na
      // próxima requisição, em vez de derrubar um usuário autenticado.
      if (!meResult.unauthenticated) {
        return token
      }

      // O backend rejeitou explicitamente o accessToken (UNAUTHENTICATED):
      // tenta renovar usando o refresh token.
      if (token.refreshToken) {
        const refreshResult = await authService.refreshToken(
          token.refreshToken as string,
        )
        if (refreshResult.ok) {
          token.sub = refreshResult.user.code
          token.id = refreshResult.user.code
          token.name = refreshResult.user.name
          token.email = refreshResult.user.email
          token.picture = refreshResult.user.avatarUrl
          token.roles = refreshResult.user.roles
          token.accessToken = refreshResult.accessToken
          token.refreshToken = refreshResult.refreshToken
          token.error = undefined
          return token
        }

        // Falha indeterminada ao renovar: preserva a sessão e tenta de novo
        // depois, em vez de assumir que o refresh token é inválido.
        if (!refreshResult.unauthenticated) {
          return token
        }
      }

      // O backend rejeitou explicitamente o accessToken e o refresh token (ou
      // não há refresh token). A sessão não pode ser renovada, mas o cookie
      // real só pode ser limpo em um contexto que permita Set-Cookie (Server
      // Action / Route Handler) — o render atual não consegue persistir isso.
      // Sinaliza a invalidação para que o chamador force o logout através de
      // `/api/auth/force-signout`.
      token.error = "RefreshAccessTokenError"
      return token
    },
    async session({ session, token }) {
      session.accessToken = token?.accessToken
      session.error = token?.error

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
