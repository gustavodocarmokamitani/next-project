import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getCategoriaById } from "../../queries"
import { updateCategoria } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import Link from "next/link"
import { notFound } from "next/navigation"

type EditCategoriaPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditarCategoriaPage({
  params,
}: EditCategoriaPageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params
  const categoria = await getCategoriaById(id)

  if (!categoria) {
    notFound()
  }

  // Não permite editar categorias globais (apenas SYSTEM pode)
  if (categoria.isGlobal && session.role !== "SYSTEM") {
    redirect("/home/categorias?error=Não é possível editar categorias globais. Apenas o administrador do sistema pode editá-las.")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>
      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/home/categorias"/>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Editar Categoria
            </h1>
            <p className="text-muted-foreground mt-2">
              Atualize as informações da categoria
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <form action={updateCategoria} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dados da Categoria
            </h2>
          </div>
          <div className="space-y-4">
            <input type="hidden" name="id" value={categoria.id} />
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria *</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={categoria.nome}
                placeholder="Ex: Adulto, Sub-18, Sub-21"
                required
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/home/categorias">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


