"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { DeleteAtletaDialog } from "./delete-atleta-dialog"
import type { AtletaDTO } from "./queries"

type AtletaCardProps = {
  atleta: AtletaDTO
}

export function AtletaCard({ atleta }: AtletaCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {atleta.firstName} {atleta.lastName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{atleta.phone}</p>
          {atleta.federationId && (
            <p className="text-sm text-muted-foreground">
              N. Federação: {atleta.federationId}
            </p>
          )}
          {atleta.confederationId && (
            <p className="text-sm text-muted-foreground">
              N. Confederação: {atleta.confederationId}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Data de Nascimento: {formatDate(atleta.birthDate)}
          </p>
          {atleta.shirtNumber && (
            <p className="text-sm text-muted-foreground">
              Número do uniforme:{" "}
              <span className="text-green-500 font-semibold">
                {atleta.shirtNumber}
              </span>
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Categorias</p>
          <div className="flex flex-wrap gap-2">
            {atleta.categorias.map((cat) => (
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
            <Link href={`/home/atletas/editar/${atleta.id}`}>
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

      <DeleteAtletaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        atletaId={atleta.id}
        atletaNome={`${atleta.firstName} ${atleta.lastName}`}
      />
    </>
  )
}

