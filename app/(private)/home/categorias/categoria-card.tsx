"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Globe } from "lucide-react"
import { DeleteCategoriaDialog } from "./delete-categoria-dialog"
import type { CategoriaDTO } from "./queries"

type CategoriaCardProps = {
  categoria: CategoriaDTO
}

export function CategoriaCard({ categoria }: CategoriaCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const isGlobal = categoria.isGlobal === true

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {isGlobal && <Globe className="h-5 w-5 text-primary" />}
              <h3 className="font-semibold text-lg">{categoria.nome}</h3>
            </div>
            {isGlobal && (
              <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                Global
              </span>
            )}
          </div>
          
          {/* Botões apenas para categorias custom (não globais) */}
          {!isGlobal && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/home/categorias/editar/${categoria.id}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          )}
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

