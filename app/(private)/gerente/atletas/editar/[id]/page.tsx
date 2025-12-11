import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getAtletaByIdDoGerente } from "../../queries"
import { getCategoriasDoGerente } from "../../../categorias/queries"
import { updateAtletaGerente } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { ResetPasswordButton } from "./reset-password-button"
import Link from "next/link"
import { notFound } from "next/navigation"

type EditAtletaPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditarAtletaPage({ params }: EditAtletaPageProps) {
  const session = await getSession()

  if (!session || session.role !== "GERENTE") {
    redirect("/login")
  }

  const { id } = await params
  const atleta = await getAtletaByIdDoGerente(id)
  const categorias = await getCategoriasDoGerente()

  if (!atleta) {
    notFound()
  }

  // Formata a data para o input type="date"
  const birthDateFormatted = atleta.birthDate
    ? new Date(atleta.birthDate).toISOString().split("T")[0]
    : ""

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/gerente/atletas" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Atleta</h1>
            <p className="text-muted-foreground mt-2">
              Atualize as informações do atleta
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <form action={updateAtletaGerente} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dados do Atleta
            </h2>
          </div>

          <input type="hidden" name="id" value={atleta.id} />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={atleta.firstName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={atleta.lastName}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={atleta.phone}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={birthDateFormatted}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shirtNumber">Nº da Camisa</Label>
                <Input
                  id="shirtNumber"
                  name="shirtNumber"
                  defaultValue={atleta.shirtNumber || ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="federationId">Nº da Federação</Label>
                <Input
                  id="federationId"
                  name="federationId"
                  defaultValue={atleta.federationId || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confederationId">Nº da Confederação</Label>
                <Input
                  id="confederationId"
                  name="confederationId"
                  defaultValue={atleta.confederationId || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categorias *</Label>
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
                      defaultChecked={atleta.categorias.some(
                        (ac) => ac.id === categoria.id,
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

            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Alterar Senha do Atleta
              </h3>
              <ResetPasswordButton />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/gerente/atletas">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

