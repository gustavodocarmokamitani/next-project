import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { Suspense } from "react"
import { OrganizacaoEditForm } from "./organizacao-edit-form"
import { notFound } from "next/navigation"

export default async function EditarOrganizacaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  const { id } = await params

  const organization = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      stripeAccountId: true,
    },
  })

  if (!organization) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4 md:hidden">
          <BackButton href={`/home/sistema/organizacoes/${id}`} />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Editar Organização</h1>
          <p className="text-muted-foreground mt-2">
            Atualize as informações da organização
          </p>
        </div>

        <OrganizacaoEditForm organization={organization} />
      </div>
    </div>
  )
}

