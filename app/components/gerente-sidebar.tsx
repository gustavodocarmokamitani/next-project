"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart3,
  Layers,
  Users,
  Trophy,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    label: "Home",
    href: "/gerente",
    icon: Home,
  },
  {
    label: "Categorias",
    href: "/gerente/categorias",
    icon: Layers,
  },
  {
    label: "Atletas",
    href: "/gerente/atletas",
    icon: Users,
  },
  {
    label: "Eventos",
    href: "/gerente/eventos",
    icon: Trophy,
  },
  {
    label: "Despesas",
    href: "/gerente/despesas",
    icon: Receipt,
  },
  {
    label: "Analytics",
    href: "/gerente/analytics",
    icon: BarChart3,
  },
]

export function GerenteSidebar() {
  const pathname = usePathname()

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
      </nav>
    </aside>
  )
}

