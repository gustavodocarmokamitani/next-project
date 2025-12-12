import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatoInscricaoById } from "../queries"
import { getCategoriasComInscricoes, getAtletasParaInscricao } from "./queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { InscricoesContent } from "./inscricoes-content"
import { Trophy } from "lucide-react"

export default async function CampeonatoInscricoesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const { id } = await params
  const campeonato = await getCampeonatoInscricaoById(id)

  if (!campeonato) {
    redirect("/home/campeonatos/inscricoes?error=Campeonato não encontrado ou você não está inscrito.")
  }

  const categorias = await getCategoriasComInscricoes(id)
  const atletas = await getAtletasParaInscricao()

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
                <BackButton href="/home/campeonatos/inscricoes" />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    Inscrições de Atletas
                  </h1>
                </div>
                <p className="text-muted-foreground mt-2">
                  {campeonato.nome}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Inscreva seus atletas nas categorias deste campeonato
                </p>
              </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    Inscrições
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {campeonato.nome}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InscricoesContent
        campeonatoId={id}
        categorias={categorias}
        atletas={atletas}
      />
    </div>
  )
}

