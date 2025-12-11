import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategoriasDoGerente } from "./queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CategoriaCard } from "./categoria-card"
import { Layers } from "lucide-react"

export default async function CategoriasPage() {
  const session = await getSession()

  if (!session || session.role !== "GERENTE") {
    redirect("/login")
  }

  const categorias = await getCategoriasDoGerente()

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
                <BackButton href="/gerente" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-3xl font-bold text-foreground">
                  Minhas Categorias
                </h1>
                <p className="text-muted-foreground mt-2">
                  Categorias que você gerencia
                </p>
              </div>
              <div className="md:hidden">
                <h1 className="text-2xl font-bold text-foreground">
                  Categorias
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {categorias.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Você não está vinculado a nenhuma categoria ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <CategoriaCard key={categoria.id} categoria={categoria} />
          ))}
        </div>
      )}
    </div>
  )
}

