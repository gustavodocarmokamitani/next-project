import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getDespesasDoGerente } from "./queries"
import { getCategoriasDoGerente } from "../categorias/queries"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { SearchWrapper } from "./search-wrapper"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DespesasPage() {
  const session = await getSession()

  if (!session || session.role !== "GERENTE") {
    redirect("/login")
  }

  const despesas = await getDespesasDoGerente()
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
            <div className="flex flex-col md:flex-row items-start gap-4 mb-4">
              <div className="md:hidden w-full">
                <BackButton href="/gerente" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-3xl font-bold text-foreground">Pagamentos</h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie os pagamentos e despesas das suas categorias
                </p>
              </div>
              <div className="md:hidden">
                <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
              </div>
            </div>
          </div>
          <Button asChild className="hidden md:flex">
            <Link href="/gerente/despesas/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pagamento
            </Link>
          </Button>
        </div>

        {/* Mobile Add Button */}
        <div className="md:hidden">
          <Button asChild className="w-full">
            <Link href="/gerente/despesas/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pagamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Pagamentos com busca */}
      {despesas.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma despesa cadastrada ainda.
          </p>
          <Button asChild>
            <Link href="/gerente/despesas/adicionar">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Pagamento
            </Link>
          </Button>
        </div>
      ) : (
        <SearchWrapper despesas={despesas} categorias={categorias} />
      )}
    </div>
  )
}

