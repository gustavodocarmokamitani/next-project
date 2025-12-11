import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getEventoByIdDoGerente } from "../../queries"
import { getCategoriasDoGerente } from "../../../categorias/queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { EventoEditForm } from "./evento-edit-form"
import { notFound } from "next/navigation"

type EditEventoPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditarEventoPage({ params }: EditEventoPageProps) {
  const session = await getSession()

  if (!session || session.role !== "GERENTE") {
    redirect("/login")
  }

  const { id } = await params
  const evento = await getEventoByIdDoGerente(id)
  const categorias = await getCategoriasDoGerente()

  if (!evento) {
    notFound()
  }

  const categoriasFormatadas = categorias.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
  }))

  const tiposEvento = [
    { id: "Treinamento", nome: "Treinamento" },
    { id: "Campeonato", nome: "Campeonato" },
    { id: "Outros", nome: "Outros" },
  ]

  // Formata a data para o input type="date"
  const dateFormatted = evento.date
    ? new Date(evento.date).toISOString().split("T")[0]
    : ""

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/gerente/eventos" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Evento</h1>
            <p className="text-muted-foreground mt-2">
              Atualize as informações do evento
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <EventoEditForm
          evento={evento}
          categorias={categoriasFormatadas}
          tiposEvento={tiposEvento}
          dateFormatted={dateFormatted}
        />
      </div>
    </div>
  )
}

