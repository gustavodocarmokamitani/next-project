import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategoriasGlobais, getCategoriasOrganizacao } from "@/app/(private)/home/categorias/queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoForm } from "./campeonato-form"

export default async function AdicionarCampeonatoPage() {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  // Busca categorias globais e organizacionais separadamente
  const [categoriasGlobais, categoriasOrganizacao] = await Promise.all([
    getCategoriasGlobais(),
    session.role === "ADMIN" ? getCategoriasOrganizacao() : Promise.resolve([]),
  ])

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
          <h1 className="text-3xl font-bold text-foreground">Criar Campeonato</h1>
          <p className="text-muted-foreground mt-2">
            Preencha os dados do campeonato. Selecione categorias globais, da organização ou crie categorias customizadas.
          </p>
        </div>

        <CampeonatoForm 
          categoriasGlobais={categoriasGlobaisFormatadas}
          categoriasOrganizacao={categoriasOrganizacaoFormatadas}
        />
      </div>
    </div>
  )
}

