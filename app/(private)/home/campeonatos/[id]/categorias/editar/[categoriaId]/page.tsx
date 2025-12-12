import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatoById } from "../../../queries"
import { getCampeonatoCategoriaById } from "../queries"
import { getCategorias } from "@/app/(private)/home/categorias/queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoCategoriaEditForm } from "./categoria-edit-form"

export default async function EditarCampeonatoCategoriaPage({
  params,
}: {
  params: Promise<{ id: string; categoriaId: string }>
}) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const { id, categoriaId } = await params
  const campeonato = await getCampeonatoById(id)

  if (!campeonato) {
    redirect("/home/campeonatos?error=Campeonato não encontrado.")
  }

  const categoria = await getCampeonatoCategoriaById(id, categoriaId)

  if (!categoria) {
    redirect(`/home/campeonatos/${id}/categorias?error=Categoria não encontrada.`)
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
            Editar Categoria do Campeonato
          </h1>
          <p className="text-muted-foreground mt-2">
            {campeonato.nome}
          </p>
        </div>

        <CampeonatoCategoriaEditForm
          campeonatoId={id}
          categoriaId={categoriaId}
          categoria={categoria}
          categoriasGlobais={categoriasGlobais}
        />
      </div>
    </div>
  )
}

