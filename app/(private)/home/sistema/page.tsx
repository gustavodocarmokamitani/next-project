import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Users, Trophy, Layers, Building2, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SistemaPage() {
  const session = await getSession()

  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  // Busca estatísticas gerais do sistema
  const [totalOrganizacoes, totalCampeonatos, totalCategoriasGlobais, totalUsuarios] = await Promise.all([
    prisma.organization.count(),
    (prisma as any).championship.count(),
    prisma.category.count({ where: { organizationId: null } }),
    prisma.user.count(),
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-foreground">Painel do Sistema</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie todas as organizações, campeonatos e categorias do sistema
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Organizações</p>
              <p className="text-2xl font-bold">{totalOrganizacoes}</p>
            </div>
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <Link href="/home/sistema/organizacoes">Gerenciar</Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Campeonatos</p>
              <p className="text-2xl font-bold">{totalCampeonatos}</p>
            </div>
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <Link href="/home/sistema/campeonatos">Ver Todos</Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categorias Globais</p>
              <p className="text-2xl font-bold">{totalCategoriasGlobais}</p>
            </div>
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
            <Link href="/home/sistema/categorias">Gerenciar</Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Usuários</p>
              <p className="text-2xl font-bold">{totalUsuarios}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

