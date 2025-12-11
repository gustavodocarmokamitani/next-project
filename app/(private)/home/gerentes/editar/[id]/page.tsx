import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getGerenteById } from "../../queries"
import { getCategorias } from "../../../categorias/queries"
import { updateGerente } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import Link from "next/link"
import { notFound } from "next/navigation"

type EditGerentePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditarGerentePage({
  params,
}: EditGerentePageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params
  const gerente = await getGerenteById(id)
  const categorias = await getCategorias()

  if (!gerente) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="mb-4">
          <BackButton className="md:hidden w-full" href="/home/gerentes" />
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Editar Gerente
          </h1>
          <p className="text-muted-foreground mt-2">
            Atualize as informações do gerente
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <form action={updateGerente} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dados do Gerente
            </h2>
          </div>

          <input type="hidden" name="id" value={gerente.id} />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={gerente.firstName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={gerente.lastName}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={gerente.phone}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Categorias Gerenciadas *</Label>
              <div className="space-y-2 mt-2 p-4 rounded-lg border border-border bg-muted/30">
                {categorias.map((categoria) => (
                  <label
                    key={categoria.id}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      name="categorias"
                      value={categoria.id}
                      defaultChecked={gerente.categorias.some(
                        (gc) => gc.id === categoria.id,
                      )}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      {categoria.nome}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/home/gerentes">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

