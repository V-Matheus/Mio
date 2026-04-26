import NextAuth, { type NextAuthResult } from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

const nextAuth = NextAuth({
  providers: [Google, GitHub],
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
  },
})

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut
export const auth: NextAuthResult["auth"] = nextAuth.auth
