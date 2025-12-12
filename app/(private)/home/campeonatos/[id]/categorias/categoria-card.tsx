"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Layers, ArrowUp } from "lucide-react"
import { DeleteCampeonatoCategoriaDialog } from "./delete-categoria-dialog"
import type { CampeonatoCategoriaDTO } from "./queries"

type CampeonatoCategoriaCardProps = {
  campeonatoId: string
  categoria: CampeonatoCategoriaDTO
}

export function CampeonatoCategoriaCard({
  campeonatoId,
  categoria,
}: CampeonatoCategoriaCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">
              {categoria.nome}
            </h3>
            {categoria.categoryId ? (
              <p className="text-sm text-muted-foreground mt-1">
                Categoria baseada em categoria existente
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Categoria custom
              </p>
            )}
            {categoria.allowUpgrade && (
              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                <ArrowUp className="h-3 w-3" />
                <span>Permite upgrade de categoria</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" asChild>
            <a href={`/home/campeonatos/${campeonatoId}/categorias/editar/${categoria.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </a>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Apagar
          </Button>
        </div>
      </div>

      <DeleteCampeonatoCategoriaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        campeonatoId={campeonatoId}
        categoriaId={categoria.id}
        categoriaNome={categoria.nome}
      />
    </>
  )
}

