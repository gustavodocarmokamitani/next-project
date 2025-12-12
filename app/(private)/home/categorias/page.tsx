import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategorias } from "./queries"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CategoriaCard } from "./categoria-card"
import Link from "next/link"
import { Plus, Globe, Layers } from "lucide-react"

export default async function CategoriasPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Se for SYSTEM, redireciona para a página de categorias globais do sistema
  if (session.role === "SYSTEM") {
    redirect("/home/sistema/categorias")
  }

  const categorias = await getCategorias()

  // Separa categorias globais e custom
  const categoriasGlobais = categorias.filter((cat) => cat.isGlobal === true)
  const categoriasCustom = categorias.filter((cat) => cat.isGlobal !== true)

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
                <h1 className="text-3xl font-bold text-foreground">
                  Todas as Categorias
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie as categorias da sua equipe
                </p>
              </div>
              <div className="md:hidden">
                <h1 className="text-2xl font-bold text-foreground">
                  Categorias
                </h1>
              </div>
            </div>
          </div>
          <Button asChild className="hidden md:flex">
            <Link href="/home/categorias/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Categoria
            </Link>
          </Button>
        </div>

        {/* Mobile Add Button */}
        <div className="md:hidden">
          <Button asChild className="w-full">
            <Link href="/home/categorias/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Categoria
            </Link>
          </Button>
        </div>
      </div>

      {/* Categorias Globais */}
      {categoriasGlobais.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Categorias Globais
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Categorias globais disponibilizadas pelo sistema. Você pode utilizá-las, mas não pode editá-las ou removê-las.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasGlobais.map((categoria) => (
              <CategoriaCard key={categoria.id} categoria={categoria} />
            ))}
          </div>
        </div>
      )}

      {/* Categorias Custom */}
      {categoriasCustom.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Categorias Custom
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Categorias criadas especificamente para sua organização. Você pode editá-las e removê-las.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasCustom.map((categoria) => (
              <CategoriaCard key={categoria.id} categoria={categoria} />
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando não há categorias */}
      {categorias.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma categoria cadastrada ainda.
          </p>
          <Button asChild>
            <Link href="/home/categorias/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Categoria
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

