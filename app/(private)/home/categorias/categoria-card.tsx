"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2 } from "lucide-react"
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <Link href={`/home/categorias/editar/${categoria.id}`}>
                  <Pencil className="h-4 w-4 text-primary" />
                  <span className="sr-only">Editar categoria</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Apagar categoria</span>
              </Button>
            </div>
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

