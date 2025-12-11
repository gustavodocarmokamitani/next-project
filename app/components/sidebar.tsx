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
  Receipt,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    label: "Gestão de Categorias",
    href: "/home/categorias",
    icon: Layers,
  },
  {
    label: "Gestão de Gerentes",
    href: "/home/gerentes",
    icon: UserCog,
  },
  {
    label: "Gestão de Atletas",
    href: "/home/atletas",
    icon: Users,
  },
  {
    label: "Central de Eventos",
    href: "/home/eventos",
    icon: Trophy,
  },
  {
    label: "Central de Despesas",
    href: "/home/despesas",
    icon: Receipt,
  },
]

export function Sidebar() {
  const pathname = usePathname()

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
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-6 flex flex-col">
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
      </nav>

      {/* Settings and Logout */}
      <div className="space-y-2 border-t border-border pt-4">
        <Link
          href="/home/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
            pathname === "/home/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  )
}

