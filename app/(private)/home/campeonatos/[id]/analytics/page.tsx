import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCampeonatoById } from "../../queries"
import { getCampeonatoAnalytics } from "./queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { AnalyticsContent } from "./analytics-content"
import { Trophy, BarChart3 } from "lucide-react"

export default async function CampeonatoAnalyticsPage({
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

  const analytics = await getCampeonatoAnalytics(id)

  if (!analytics) {
    redirect("/home/campeonatos?error=Você não tem permissão para ver este campeonato.")
  }

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
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    Analytics do Campeonato
                  </h1>
                </div>
                <p className="text-muted-foreground mt-2">
                  {campeonato.nome}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualize estatísticas, inscrições e pagamentos do campeonato
                </p>
              </div>
              <div className="md:hidden">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">
                    Analytics
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

      <AnalyticsContent analytics={analytics} />
    </div>
  )
}

