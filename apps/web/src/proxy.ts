import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const AUTH_ROUTES = ["/login", "/cadastro", "/recuperar-senha"]
const PUBLIC_ROUTES = ["/"]

/** Definição de prefixos de rotas permitidos por cada perfil de acesso */
const STUDENT_ALLOWED_PREFIXES = [
  "/home",
  "/trilhas",
  "/desafios",
  "/comunidade",
  "/perfil",
]

const TEACHER_ALLOWED_PREFIXES = [...STUDENT_ALLOWED_PREFIXES, "/studio"]

const ADMIN_ALLOWED_PREFIXES = [...TEACHER_ALLOWED_PREFIXES, "/painel"]

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  })

  const isLoggedIn = !!token
  const pathname = req.nextUrl.pathname
  const isAuthRoute = AUTH_ROUTES.some((path) => pathname.startsWith(path))
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Redireciona usuários já logados tentando acessar páginas de autenticação (login/cadastro)
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", req.nextUrl))
  }

  // Redireciona usuários anônimos tentando acessar qualquer rota privada
  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Validação de permissões para usuários autenticados usando os arrays de rotas
  if (isLoggedIn) {
    const roles = (token?.roles as string[]) || []
    const isAdmin = roles.includes("ADMIN")
    const isTeacher = roles.includes("TEACHER")

    const allowedPrefixes = isAdmin
      ? ADMIN_ALLOWED_PREFIXES
      : isTeacher
        ? TEACHER_ALLOWED_PREFIXES
        : STUDENT_ALLOWED_PREFIXES

    const isAllowed = allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix),
    )

    if (!isAllowed) {
      // Se for um professor tentando acessar uma rota restrita do Admin (ex: /painel) -> /studio
      // Se for um estudante tentando acessar rotas de staff (/studio ou /painel) -> /home
      const fallback = isTeacher ? "/studio" : "/home"
      return NextResponse.redirect(new URL(fallback, req.nextUrl))
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.).*)"],
}
