import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatoById } from "@/app/(private)/home/campeonatos/queries"
import { getCategoriasGlobais, getCategoriasOrganizacao } from "@/app/(private)/home/categorias/queries"
import { getCampeonatoCategorias } from "@/app/(private)/home/campeonatos/[id]/categorias/queries"
import { getDespesasCampeonato } from "@/app/(private)/home/campeonatos/queries-despesas"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoEditForm } from "./campeonato-edit-form"

export default async function EditarCampeonatoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const { id } = await params
  const [campeonato, categoriasGlobais, categoriasOrganizacao, categoriasCampeonato, despesas] =
    await Promise.all([
      getCampeonatoById(id),
      getCategoriasGlobais(),
      session.role === "ADMIN" ? getCategoriasOrganizacao() : Promise.resolve([]),
      getCampeonatoCategorias(id),
      getDespesasCampeonato(id),
    ])

  if (!campeonato) {
    redirect("/home/campeonatos?error=Campeonato não encontrado.")
  }

  const categoriasGlobaisFormatadas = categoriasGlobais.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
    tipo: "global" as const,
  }))

  const categoriasOrganizacaoFormatadas = categoriasOrganizacao.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
    tipo: "organizacao" as const,
  }))

  // Separa as categorias do campeonato por tipo
  const categoriasGlobaisSelecionadas = categoriasCampeonato
    .filter((cat) => cat.tipo === "global")
    .map((cat) => cat.categoryId!)
  
  const categoriasOrganizacaoSelecionadas = categoriasCampeonato
    .filter((cat) => cat.tipo === "organizacao")
    .map((cat) => cat.categoryId!)

  const categoriasCustom = categoriasCampeonato
    .filter((cat) => cat.tipo === "custom")
    .map((cat) => ({
      id: cat.id,
      nome: cat.nome,
      allowUpgrade: cat.allowUpgrade,
    }))

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4 md:hidden">
          <BackButton href="/home/campeonatos" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Editar Campeonato</h1>
          <p className="text-muted-foreground mt-2">
            Atualize as informações do campeonato. Selecione categorias globais, da organização ou crie categorias customizadas.
          </p>
        </div>

        <CampeonatoEditForm
          campeonato={campeonato}
          categoriasGlobais={categoriasGlobaisFormatadas}
          categoriasOrganizacao={categoriasOrganizacaoFormatadas}
          categoriasGlobaisSelecionadas={categoriasGlobaisSelecionadas}
          categoriasOrganizacaoSelecionadas={categoriasOrganizacaoSelecionadas}
          categoriasCustom={categoriasCustom}
          despesasIniciais={despesas}
        />
      </div>
    </div>
  )
}

