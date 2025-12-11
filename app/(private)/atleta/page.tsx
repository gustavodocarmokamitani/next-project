import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { LogoutButton } from "@/app/components/logout-button"
import { SettingsButton } from "@/app/components/settings-button"
import { AtletaHomeContent } from "./atleta-home-content"
import { getEventosForAtleta, getDespesasForAtleta } from "./queries"
import { Suspense } from "react"
import { InfoCard } from "./info-card"

export default async function AtletaPage() {
  const session = await getSession()

  if (!session || session.role !== "ATLETA" || !session.athleteId) {
    redirect("/login")
  }

  const eventos = await getEventosForAtleta(session.athleteId)
  const despesas = await getDespesasForAtleta(session.athleteId)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {session.name || "Atleta"}!
            </h1>
            {session.teamName && (
              <p className="text-lg text-primary font-semibold mb-2">
                {session.teamName}
              </p>
            )}
            <p className="text-muted-foreground">
              Confirme sua presença nos eventos e gerencie seus pagamentos
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <SettingsButton />
            <LogoutButton />
          </div>
        </div>

        {/* Info Card */}
        <InfoCard eventos={eventos} despesas={despesas} />
      </div>

      {/* Events and Payments */}
      <Suspense fallback={<div>Carregando...</div>}>
        <AtletaHomeContent eventos={eventos} despesas={despesas} athleteId={session.athleteId} />
      </Suspense>
    </div>
  )
}

