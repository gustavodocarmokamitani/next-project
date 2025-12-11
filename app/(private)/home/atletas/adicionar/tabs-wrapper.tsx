"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link as LinkIcon, UserPlus } from "lucide-react"
import { CadastroDiretoForm } from "./cadastro-direto-form"
import { InviteLinkGenerator } from "../invite-link-generator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { generateAtletaInviteLink } from "../actions"

type TabsWrapperProps = {
  categorias: { id: string; nome: string }[]
}

export function TabsWrapper({ categorias }: TabsWrapperProps) {
  const searchParams = useSearchParams()
  const link = searchParams.get("link")
  const tab = searchParams.get("tab")
  
  // Se houver link gerado ou tab=convite na URL, mostra a aba de convite por padrão
  const defaultValue = link || tab === "convite" ? "convite" : "direto"

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="direto">
          <UserPlus className="h-4 w-4 mr-2" />
          Cadastrar Diretamente
        </TabsTrigger>
        <TabsTrigger value="convite">
          <LinkIcon className="h-4 w-4 mr-2" />
          Gerar Link de Convite
        </TabsTrigger>
      </TabsList>

      <TabsContent value="direto" className="mt-6">
        <div className="rounded-lg border border-border bg-card p-8">
          <CadastroDiretoForm categorias={categorias} />
        </div>
      </TabsContent>

      <TabsContent value="convite" className="mt-6">
        <div className="rounded-lg border border-border bg-card p-8">
          <form action={generateAtletaInviteLink} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Selecionar Categorias
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione as categorias que o atleta irá participar. O atleta
                verá essas categorias no momento do cadastro via link.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categorias Disponíveis *</Label>
                <div className="space-y-2 mt-2">
                  {categorias.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma categoria cadastrada.{" "}
                      <Link
                        href="/home/categorias/adicionar"
                        className="text-primary hover:underline"
                      >
                        Adicionar categoria
                      </Link>
                    </p>
                  ) : (
                    categorias.map((categoria) => (
                      <label
                        key={categoria.id}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          name="categorias"
                          value={categoria.id}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-sm text-foreground">
                          {categoria.nome}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={categorias.length === 0}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Gerar Link de Convite
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/home/atletas">Cancelar</Link>
              </Button>
            </div>
          </form>
        </div>
        <InviteLinkGenerator />
      </TabsContent>
    </Tabs>
  )
}

