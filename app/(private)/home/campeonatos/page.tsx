import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatos } from "./queries"
import { getConvitesPendentes } from "./queries-pending-invites"
import { getCampeonatosInscritos } from "./inscricoes/queries"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoCard } from "./campeonato-card"
import { ConvitesPendentesSection } from "./convites-pendentes-section"
import { HistoricoCampeonatosSection } from "./historico-campeonatos-section"
import Link from "next/link"
import { Plus, Trophy } from "lucide-react"

export default async function CampeonatosPage() {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const [campeonatos, convitesPendentes, campeonatosInscritos] = await Promise.all([
    getCampeonatos(),
    getConvitesPendentes(),
    getCampeonatosInscritos(),
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="md:hidden w-full">
                <BackButton href="/home" />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">Campeonatos</h1>
                </div>
                <p className="text-muted-foreground mt-2">
                  Gerencie os campeonatos organizados pela sua organização
                </p>
              </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Campeonatos</h1>
                </div>
              </div>
            </div>
          </div>
          <Button asChild className="hidden md:flex">
            <Link href="/home/campeonatos/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Criar Campeonato
            </Link>
          </Button>
        </div>

        {/* Mobile Add Button */}
        <div className="md:hidden">
          <Button asChild className="w-full">
            <Link href="/home/campeonatos/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Criar Campeonato
            </Link>
          </Button>
        </div>
      </div>

      {/* Convites Pendentes */}
      <ConvitesPendentesSection convites={convitesPendentes} />

      {/* Histórico de Campeonatos */}
      <HistoricoCampeonatosSection
        campeonatosOrganizados={campeonatos}
        campeonatosInscritos={campeonatosInscritos}
      />
    </div>
  )
}

