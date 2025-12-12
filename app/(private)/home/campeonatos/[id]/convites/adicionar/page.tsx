import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatoById } from "@/app/(private)/home/campeonatos/queries"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoConviteForm } from "./convite-form"

export default async function AdicionarCampeonatoConvitePage({
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4 md:hidden">
          <BackButton href={`/home/campeonatos/${id}/convites`} />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Criar Convite para Campeonato
          </h1>
          <p className="text-muted-foreground mt-2">
            {campeonato.nome}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Crie um link de convite público que qualquer organização pode usar para participar deste campeonato
          </p>
        </div>

        <CampeonatoConviteForm campeonatoId={id} />
      </div>
    </div>
  )
}

