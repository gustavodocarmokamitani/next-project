import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE_NAME = "session_token"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Rotas públicas - sempre permitidas
  const publicRoutes = ["/", "/login", "/register"]
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/api/") || pathname.startsWith("/campeonato/") || pathname.startsWith("/gerente/convite/") || pathname.startsWith("/atleta/convite/")

  // Se for rota pública, permite acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Para rotas privadas, apenas verifica se tem cookie
  // O redirecionamento será feito pelos layouts individuais
  // Isso evita loops de redirecionamento
  const privateRoutes = ["/home", "/gerente", "/atleta"]
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route))

  if (isPrivateRoute && !sessionToken) {
    // Redireciona para login apenas se não tiver cookie
    // Mas não redireciona se já estiver na página de login (evita loop)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Permite todas as outras rotas
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
