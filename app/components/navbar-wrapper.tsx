"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"

export function NavbarWrapper() {
  const pathname = usePathname()
  // Esconde navbar em login/register, nas rotas privadas (que têm sidebar) e nas páginas de convite
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/gerente") ||
    pathname.startsWith("/atleta") ||
    pathname.startsWith("/campeonato/convite") ||
    pathname.startsWith("/atleta/convite") ||
    pathname.startsWith("/organizacao/cadastro") ||
    pathname.startsWith("/gerente/convite")

  if (hideNavbar) {
    return null
  }

  return <Navbar />
}

