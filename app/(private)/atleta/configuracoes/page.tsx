import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getAtletaById } from "@/app/(private)/home/atletas/queries"
import { AtletaConfigForm } from "./atleta-config-form"
import { BackButton } from "@/app/components/back-button"
import { Suspense } from "react"
import { AlertMessage } from "@/app/components/alert-message"

export default async function AtletaConfiguracoesPage() {
  const session = await getSession()

  if (!session || session.role !== "ATLETA" || !session.athleteId) {
    redirect("/login")
  }

  const atleta = await getAtletaById(session.athleteId)

  if (!atleta) {
    redirect("/atleta")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4">
          <BackButton href="/atleta" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Atualize suas informações pessoais
          </p>
        </div>

        <AtletaConfigForm atleta={atleta} />
      </div>
    </div>
  )
}

