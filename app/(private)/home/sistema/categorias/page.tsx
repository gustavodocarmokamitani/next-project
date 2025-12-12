import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategoriasGlobais } from "./queries"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import Link from "next/link"
import { Plus, Layers, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"

export default async function CategoriasGlobaisPage() {
  const session = await getSession()

  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  const categorias = await getCategoriasGlobais()

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
                <BackButton href="/home/sistema" />
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Categorias Globais
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Gerencie as categorias globais disponíveis para todas as organizações
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button asChild className="hidden md:flex">
            <Link href="/home/sistema/categorias/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Categoria Global
            </Link>
          </Button>
        </div>

        {/* Mobile Add Button */}
        <div className="md:hidden">
          <Button asChild className="w-full">
            <Link href="/home/sistema/categorias/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Categoria Global
            </Link>
          </Button>
        </div>
      </div>

      {/* Categories List */}
      {categorias.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Nenhuma categoria global cadastrada ainda.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Categorias globais são disponibilizadas para todas as organizações selecionarem em campeonatos.
          </p>
          <Button asChild>
            <Link href="/home/sistema/categorias/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Categoria Global
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <Card key={categoria.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{categoria.nome}</h3>
                </div>
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                  Global
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Criada em {new Date(categoria.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/home/sistema/categorias/editar/${categoria.id}`}>
                    Editar
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

