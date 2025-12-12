"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart3,
  Layers,
  UserCog,
  Users,
  Trophy,
  Medal,
  Receipt,
  Settings,
  LogOut,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navigationItems = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
  },
  {
    label: "Analytics",
    href: "/home/analytics",
    icon: BarChart3,
  },
  {
    label: "Categorias",
    href: "/home/categorias",
    icon: Layers,
  },
  {
    label: "Gerentes",
    href: "/home/gerentes",
    icon: UserCog,
  },
  {
    label: "Atletas",
    href: "/home/atletas",
    icon: Users,
  },
  {
    label: "Eventos",
    href: "/home/eventos",
    icon: Trophy,
  },
  {
    label: "Campeonatos",
    href: "/home/campeonatos",
    icon: Medal,
  },
  {
    label: "Inscrições",
    href: "/home/campeonatos/inscricoes",
    icon: Users,
  },
  {
    label: "Pagamentos",
    href: "/home/despesas",
    icon: Receipt,
  },
]

export function SidebarClient() {
  const pathname = usePathname()
  const [isSystem, setIsSystem] = useState(false)

  useEffect(() => {
    // Verifica se é SYSTEM através da URL ou cookie
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === "SYSTEM") {
          setIsSystem(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Fallback: tenta remover o cookie manualmente
      document.cookie =
        "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      window.location.href = "/login"
    }
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-6 flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Team Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        
        {/* Sistema Admin Section */}
        {isSystem && (
          <>
            <div className="my-4 border-t border-border" />
            <Link
              href="/home/sistema"
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                pathname?.startsWith("/home/sistema")
                  ? "bg-red-500 text-white"
                  : "text-red-500 hover:bg-red-500/10",
              )}
            >
              <Shield className="h-5 w-5" />
              <span>Sistema</span>
            </Link>
          </>
        )}
      </nav>

      {/* Settings & Logout */}
      <div className="mt-auto space-y-2 border-t border-border pt-4">
        <Link
          href="/home/configuracoes"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
            pathname === "/home/configuracoes"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  )
}

