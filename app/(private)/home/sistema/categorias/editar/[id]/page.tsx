import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategoriaGlobalById } from "../../queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CategoriaGlobalEditForm } from "./categoria-global-edit-form"

export default async function EditarCategoriaGlobalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  const { id } = await params
  const categoria = await getCategoriaGlobalById(id)

  if (!categoria) {
    redirect("/home/sistema/categorias?error=Categoria não encontrada.")
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
          <h1 className="text-3xl font-bold text-foreground">Editar Categoria Global</h1>
          <p className="text-muted-foreground mt-2">
            Atualize as informações da categoria global.
          </p>
        </div>

        <CategoriaGlobalEditForm categoria={categoria} />
      </div>
    </div>
  )
}

