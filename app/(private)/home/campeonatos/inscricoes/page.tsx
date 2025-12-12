import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatosInscritos } from "./queries"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoInscricaoCard } from "./campeonato-inscricao-card"
import Link from "next/link"
import { Trophy, Users } from "lucide-react"

export default async function CampeonatosInscricoesPage() {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const campeonatos = await getCampeonatosInscritos()

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
                  <Users className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    Campeonatos Inscritos
                  </h1>
                </div>
                <p className="text-muted-foreground mt-2">
                  Gerencie as inscrições de atletas nos campeonatos que sua organização foi convidada
                </p>
              </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    Inscrições
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campeonatos */}
      {campeonatos.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Sua organização ainda não está inscrita em nenhum campeonato.
          </p>
          <p className="text-sm text-muted-foreground">
            Aceite um convite de campeonato para começar a inscrever atletas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campeonatos.map((campeonato) => (
            <CampeonatoInscricaoCard
              key={campeonato.id}
              campeonato={campeonato}
            />
          ))}
        </div>
      )}
    </div>
  )
}

