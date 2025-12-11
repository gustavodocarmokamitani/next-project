import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategorias } from "@/app/(private)/home/categorias/queries"
import { getEventos } from "@/app/(private)/home/eventos/queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { DespesaForm } from "./despesa-form"

export default async function AdicionarDespesaPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const categorias = await getCategorias()
  const eventos = await getEventos()

  const categoriasFormatadas = categorias.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
  }))

  const eventosFormatados = eventos.map((evento) => ({
    id: evento.id,
    name: evento.name,
    categorias: evento.categorias,
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/home/despesas" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Adicionar Despesa</h1>
            <p className="text-muted-foreground mt-2">
              Preencha os dados da despesa. Depois você poderá adicionar os itens.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <DespesaForm categorias={categoriasFormatadas} eventos={eventosFormatados} />
      </div>
    </div>
  )
}

