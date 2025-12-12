import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { CategoriaForm } from "./categoria-form"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"

export default async function AdicionarCategoriaPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Se for SYSTEM, redireciona para a página de categorias globais
  if (session.role === "SYSTEM") {
    redirect("/home/sistema/categorias/adicionar")
  }

  // Apenas ADMINs podem adicionar categorias à organização
  if (session.role !== "ADMIN") {
    redirect("/login?error=Acesso negado. Apenas administradores podem adicionar categorias.")
  }

  // ADMIN precisa ter uma organização associada
  if (!session.organizationId) {
    redirect("/home/categorias?error=Você precisa estar associado a uma organização para adicionar categorias.")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>
      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/home/categorias" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Criar Categoria Custom
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie uma categoria exclusiva para sua organização
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <CategoriaForm />
      </div>
    </div>
  )
}

