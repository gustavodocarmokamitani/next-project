import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatoById } from "@/app/(private)/home/campeonatos/queries"
import { getCategorias } from "@/app/(private)/home/categorias/queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoCategoriaForm } from "./categoria-form"

export default async function AdicionarCampeonatoCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const { id } = await params
  const campeonato = await getCampeonatoById(id)

  if (!campeonato) {
    redirect("/home/campeonatos?error=Campeonato não encontrado.")
  }

  const categoriasGlobais = await getCategorias()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4 md:hidden">
          <BackButton href={`/home/campeonatos/${id}/categorias`} />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Adicionar Categoria ao Campeonato
          </h1>
          <p className="text-muted-foreground mt-2">
            {campeonato.nome}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione uma categoria global existente ou crie uma categoria custom para este campeonato.
          </p>
        </div>

        <CampeonatoCategoriaForm
          campeonatoId={id}
          categoriasGlobais={categoriasGlobais}
        />
      </div>
    </div>
  )
}

