"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"

export function NavbarWrapper() {
  const pathname = usePathname()
  // Esconde navbar em login/register e nas rotas privadas (que têm sidebar)
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/home")

  if (hideNavbar) {
    return null
  }

  return <Navbar />
}

