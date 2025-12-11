import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { createCategoria } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import Link from "next/link"

export default async function AdicionarCategoriaPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
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
              Adicionar Categoria
            </h1>
            <p className="text-muted-foreground mt-2">
              Preencha os dados da nova categoria
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <form action={createCategoria} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dados da Categoria
            </h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria *</Label>
              <Input
                id="nome"
                name="nome"
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

