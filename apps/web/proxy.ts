import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const AUTH_ROUTES = ["/login", "/cadastro", "/recuperar-senha"]
const PUBLIC_ROUTES = ["/"]

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  })

  const isLoggedIn = !!token
  const pathname = req.nextUrl.pathname
  const isAuthRoute = AUTH_ROUTES.some((path) => pathname.startsWith(path))
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", req.nextUrl))
  }

  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
