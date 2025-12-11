"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { DeleteCategoriaDialog } from "./delete-categoria-dialog"
import type { CategoriaDTO } from "./queries"

type CategoriaCardProps = {
  categoria: CategoriaDTO
}

export function CategoriaCard({ categoria }: CategoriaCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              {categoria.nome}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover categoria</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteCategoriaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categoriaId={categoria.id}
        categoriaNome={categoria.nome}
      />
    </>
  )
}

