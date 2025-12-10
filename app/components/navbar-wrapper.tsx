"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"

export function NavbarWrapper() {
  const pathname = usePathname()
  const hideNavbar = pathname === "/login" || pathname === "/register"

  if (hideNavbar) {
    return null
  }

  return <Navbar />
}

