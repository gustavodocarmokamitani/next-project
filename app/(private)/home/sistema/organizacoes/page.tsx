import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Building2, Users, Trophy, Calendar, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OrganizacoesPage() {
  const session = await getSession()

  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  // Busca todas as organizações com estatísticas
  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          admin: true,
          managers: true,
          athletes: true,
          events: true,
          organizedChampionships: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Organizações</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie todas as organizações do sistema
        </p>
      </div>

      {/* Lista de Organizações */}
      {organizations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhuma organização cadastrada ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {org.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Criada em {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Building2 className="h-6 w-6 text-primary" />
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Admins</p>
                    <p className="text-sm font-semibold">{org._count.admin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Gerentes</p>
                    <p className="text-sm font-semibold">{org._count.managers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Atletas</p>
                    <p className="text-sm font-semibold">{org._count.athletes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Eventos</p>
                    <p className="text-sm font-semibold">{org._count.events}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Campeonatos</p>
                    <p className="text-sm font-semibold">{org._count.organizedChampionships}</p>
                  </div>
                </div>
              </div>

              {/* Botão de Ações */}
              <Button asChild className="w-full" variant="outline">
                <Link href={`/home/sistema/organizacoes/${org.id}`}>
                  Gerenciar Organização
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

