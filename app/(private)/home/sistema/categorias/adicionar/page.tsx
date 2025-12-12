import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CategoriaGlobalForm } from "./categoria-global-form"

export default async function AdicionarCategoriaGlobalPage() {
  const session = await getSession()

  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4 md:hidden">
          <BackButton href="/home/sistema/categorias" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Adicionar Categoria Global</h1>
          <p className="text-muted-foreground mt-2">
            Crie uma categoria global que ficará disponível para todas as organizações selecionarem em campeonatos.
          </p>
        </div>

        <CategoriaGlobalForm />
      </div>
    </div>
  )
}

