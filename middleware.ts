import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE_NAME = "session_token"

// Rotas públicas que não precisam de autenticação
const publicRoutes = ["/", "/login", "/register"]

// Rotas privadas que precisam de autenticação
const privateRoutes = ["/home", "/dashboard", "/gerente", "/atleta"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Verifica se é uma rota privada
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  )

  // Se for rota privada e não tiver sessão, redireciona para login
  if (isPrivateRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se tiver sessão e tentar acessar login/register, redireciona para home
  if (sessionToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

