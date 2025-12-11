"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { DeleteGerenteDialog } from "./delete-gerente-dialog"
import type { GerenteDTO } from "./queries"

type GerenteCardProps = {
  gerente: GerenteDTO
}

export function GerenteCard({ gerente }: GerenteCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            {gerente.firstName} {gerente.lastName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{gerente.phone}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Categorias</p>
          <div className="flex flex-wrap gap-2">
            {gerente.categorias.map((cat) => (
              <span
                key={cat.id}
                className="px-3 py-1 rounded-md bg-muted text-sm text-foreground"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/home/gerentes/editar/${gerente.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
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

      <DeleteGerenteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        gerenteId={gerente.id}
        gerenteNome={`${gerente.firstName} ${gerente.lastName}`}
      />
    </>
  )
}

