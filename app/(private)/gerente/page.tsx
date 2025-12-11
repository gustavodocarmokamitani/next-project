import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { UserInfo } from "@/app/components/user-info"
import { LogoutButton } from "@/app/components/logout-button"
import { SettingsButton } from "@/app/components/settings-button"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, CreditCard, Users, BarChart3, Layers } from "lucide-react"

export default async function GerentePage() {
  const session = await getSession()

  if (!session || session.role !== "GERENTE") {
    redirect("/login")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {session.name || "Gerente"}!
            </h1>
            {session.teamName && (
              <p className="text-lg text-primary font-semibold mb-2">
                {session.teamName}
              </p>
            )}
            <p className="text-muted-foreground">
              Gerencie suas categorias, atletas, eventos e despesas
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <SettingsButton />
            <LogoutButton />
          </div>
        </div>

        <UserInfo />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button asChild variant="outline" className="h-auto p-6 flex-col items-start">
          <Link href="/gerente/categorias">
            <Layers className="h-8 w-8 mb-2 text-primary" />
            <span className="font-semibold">Categorias</span>
            <span className="text-xs text-muted-foreground mt-1">
              Gerenciar categorias
            </span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-6 flex-col items-start">
          <Link href="/gerente/atletas">
            <Users className="h-8 w-8 mb-2 text-primary" />
            <span className="font-semibold">Atletas</span>
            <span className="text-xs text-muted-foreground mt-1">
              Visualizar atletas
            </span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-6 flex-col items-start">
          <Link href="/gerente/eventos">
            <Calendar className="h-8 w-8 mb-2 text-primary" />
            <span className="font-semibold">Eventos</span>
            <span className="text-xs text-muted-foreground mt-1">
              Gerenciar eventos
            </span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-6 flex-col items-start">
          <Link href="/gerente/despesas">
            <CreditCard className="h-8 w-8 mb-2 text-primary" />
            <span className="font-semibold">Despesas</span>
            <span className="text-xs text-muted-foreground mt-1">
              Visualizar despesas
            </span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto p-6 flex-col items-start">
          <Link href="/gerente/analytics">
            <BarChart3 className="h-8 w-8 mb-2 text-primary" />
            <span className="font-semibold">Analytics</span>
            <span className="text-xs text-muted-foreground mt-1">
              Métricas e estatísticas
            </span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

