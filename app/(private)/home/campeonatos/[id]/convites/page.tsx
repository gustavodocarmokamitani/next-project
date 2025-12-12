import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatoById } from "../../queries"
import { getCampeonatoConvites } from "./queries"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { CampeonatoConviteCard } from "./convite-card"
import Link from "next/link"
import { Plus, Mail } from "lucide-react"

export default async function CampeonatoConvitesPage({
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

  const convites = await getCampeonatoConvites(id)

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
                <BackButton href={`/home/campeonatos/${id}/categorias`} />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    Convites do Campeonato
                  </h1>
                </div>
                <p className="text-muted-foreground mt-2">
                  {campeonato.nome}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Convide organizações para participarem deste campeonato
                </p>
              </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    Convites
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {campeonato.nome}
                </p>
              </div>
            </div>
          </div>
          <Button asChild className="hidden md:flex">
            <Link href={`/home/campeonatos/${id}/convites/adicionar`}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Convite
            </Link>
          </Button>
        </div>

        {/* Mobile Add Button */}
        <div className="md:hidden">
          <Button asChild className="w-full">
            <Link href={`/home/campeonatos/${id}/convites/adicionar`}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Convite
            </Link>
          </Button>
        </div>
      </div>

      {/* Convites */}
      {convites.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Nenhum convite criado ainda.
          </p>
          <Button asChild>
            <Link href={`/home/campeonatos/${id}/convites/adicionar`}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Convite
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {convites.map((convite) => (
            <CampeonatoConviteCard
              key={convite.id}
              campeonatoId={id}
              convite={convite}
            />
          ))}
        </div>
      )}
    </div>
  )
}

