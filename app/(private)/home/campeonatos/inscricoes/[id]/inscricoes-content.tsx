"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Search, UserPlus, Users, ArrowUp } from "lucide-react"
import { inscreverAtleta, removerInscricao, confirmarInscricao } from "./actions"
import type { CategoriaInscricaoDTO, AtletaInscricaoDTO } from "./queries"

type InscricoesContentProps = {
  campeonatoId: string
  categorias: CategoriaInscricaoDTO[]
  atletas: AtletaInscricaoDTO[]
}

export function InscricoesContent({
  campeonatoId,
  categorias,
  atletas,
}: InscricoesContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [inscricaoDialogOpen, setInscricaoDialogOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaInscricaoDTO | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredAtletas = atletas.filter(
    (atleta) =>
      `${atleta.firstName} ${atleta.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      atleta.phone.includes(search),
  )

  const handleOpenInscricaoDialog = (categoria: CategoriaInscricaoDTO) => {
    setSelectedCategoria(categoria)
    setInscricaoDialogOpen(true)
  }

  const handleInscrever = async (atletaId: string) => {
    if (!selectedCategoria) return

    setLoading(true)
    try {
      await inscreverAtleta(campeonatoId, selectedCategoria.id, atletaId)
      router.refresh()
    } catch (error) {
      console.error("Erro ao inscrever atleta:", error)
    } finally {
      setLoading(false)
      setInscricaoDialogOpen(false)
    }
  }

  const handleRemover = async (categoriaId: string, atletaId: string) => {
    if (!confirm("Deseja realmente remover esta inscrição?")) return

    setLoading(true)
    try {
      await removerInscricao(campeonatoId, categoriaId, atletaId)
      router.refresh()
    } catch (error) {
      console.error("Erro ao remover inscrição:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmar = async (categoriaId: string, atletaId: string) => {
    setLoading(true)
    try {
      await confirmarInscricao(campeonatoId, categoriaId, atletaId)
      router.refresh()
    } catch (error) {
      console.error("Erro ao confirmar inscrição:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtra atletas que ainda não estão inscritos na categoria selecionada
  const atletasDisponiveis = selectedCategoria
    ? filteredAtletas.filter(
        (atleta) =>
          !selectedCategoria.atletasInscritos.some((inscrito) => inscrito.id === atleta.id),
      )
    : []

  return (
    <>
      <div className="space-y-6">
        {categorias.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Este campeonato ainda não possui categorias cadastradas.
            </p>
          </div>
        ) : (
          categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="rounded-lg border border-border bg-card p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {categoria.nome}
                    </h3>
                    {categoria.allowUpgrade && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <ArrowUp className="h-3 w-3" />
                        Permite upgrade
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categoria.atletasInscritos.length} atleta(s) inscrito(s)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenInscricaoDialog(categoria)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inscrever Atleta
                </Button>
              </div>

              {categoria.atletasInscritos.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                  {categoria.atletasInscritos.map((atleta) => {
                    const atletaCompleto = atletas.find((a) => a.id === atleta.id)
                    return (
                      <div
                        key={atleta.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {atleta.firstName} {atleta.lastName}
                            </p>
                            {atletaCompleto && (
                              <p className="text-xs text-muted-foreground">
                                {atletaCompleto.categorias.map((c) => c.name).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {atleta.confirmed ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Confirmado
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConfirmar(categoria.id, atleta.id)}
                              disabled={loading}
                            >
                              Confirmar
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemover(categoria.id, atleta.id)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Dialog de Inscrição */}
      <Dialog open={inscricaoDialogOpen} onOpenChange={setInscricaoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Inscrever Atleta - {selectedCategoria?.nome}
            </DialogTitle>
            <DialogDescription>
              Selecione um atleta para inscrever nesta categoria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Atleta</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {atletasDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {search
                    ? "Nenhum atleta encontrado"
                    : "Todos os atletas já estão inscritos nesta categoria"}
                </p>
              ) : (
                atletasDisponiveis.map((atleta) => (
                  <div
                    key={atleta.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent cursor-pointer"
                    onClick={() => handleInscrever(atleta.id)}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {atleta.firstName} {atleta.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {atleta.phone}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Categorias: {atleta.categorias.map((c) => c.name).join(", ") || "Nenhuma"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleInscrever(atleta.id)
                      }}
                      disabled={loading}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Inscrever
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

