import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getGerenteById } from "@/app/(private)/home/gerentes/queries"
import { GerenteConfigForm } from "./gerente-config-form"
import { BackButton } from "@/app/components/back-button"
import { Suspense } from "react"
import { AlertMessage } from "@/app/components/alert-message"

export default async function GerenteConfiguracoesPage() {
  const session = await getSession()

  if (!session || session.role !== "GERENTE" || !session.managerId) {
    redirect("/login")
  }

  const gerente = await getGerenteById(session.managerId)

  if (!gerente) {
    redirect("/gerente")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4 md:hidden">
          <BackButton href="/gerente" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Atualize suas informações pessoais
          </p>
        </div>

        <GerenteConfigForm gerente={gerente} />
      </div>
    </div>
  )
}

