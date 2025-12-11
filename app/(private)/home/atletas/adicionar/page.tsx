import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategorias } from "@/app/(private)/home/categorias/queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { TabsWrapper } from "./tabs-wrapper"

export default async function AdicionarAtletaPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const categorias = await getCategorias()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/home/atletas" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Adicionar Atleta</h1>
            <p className="text-muted-foreground mt-2">
              Cadastre um atleta diretamente ou gere um link de convite
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Suspense fallback={<div className="rounded-lg border border-border bg-card p-8">Carregando...</div>}>
        <TabsWrapper categorias={categorias} />
      </Suspense>
    </div>
  )
}

