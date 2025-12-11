import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategorias } from "@/app/(private)/home/categorias/queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { EventoForm } from "./evento-form"

export default async function AdicionarEventoPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const categorias = await getCategorias()
  const categoriasFormatadas = categorias.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
  }))

  const tiposEvento = [
    { id: "Treinamento", nome: "Treinamento" },
    { id: "Campeonato", nome: "Campeonato" },
    { id: "Outros", nome: "Outros" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/home/eventos" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Adicionar Evento</h1>
            <p className="text-muted-foreground mt-2">
              Preencha os dados do novo evento
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <EventoForm categorias={categoriasFormatadas} tiposEvento={tiposEvento} />
      </div>
    </div>
  )
}

