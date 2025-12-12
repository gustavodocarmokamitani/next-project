import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { BackButton } from "@/app/components/back-button"
import { Suspense } from "react"
import { AlertMessage } from "@/app/components/alert-message"
import { AdminConfigForm } from "./admin-config-form"
import { prisma } from "@/lib/prisma"

export default async function AdminConfiguracoesPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      organizationName: true,
    },
  })

  if (!user) {
    redirect("/home")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4 md:hidden">
          <BackButton href="/home" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais e da organização
          </p>
        </div>

        <AdminConfigForm user={user} />
      </div>
    </div>
  )
}

