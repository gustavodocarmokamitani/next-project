import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { BackButton } from "@/app/components/back-button"
import { AnalyticsContent } from "./analytics-content"
import { getEventosAnalytics } from "./queries"
import { DownloadReportButton } from "./download-report-button"

export default async function AnalyticsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const eventos = await getEventosAnalytics()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
            <div className="md:hidden w-full">
              <BackButton href="/home" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Visualize métricas e estatísticas dos eventos
              </p>
            </div>
          </div>
          <DownloadReportButton eventos={eventos} />
        </div>
      </div>

      {/* Events Section with Search */}
      <AnalyticsContent eventos={eventos} />
    </div>
  )
}

