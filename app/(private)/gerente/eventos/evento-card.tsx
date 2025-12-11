"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Users } from "lucide-react"
import { DeleteEventoDialog } from "./delete-evento-dialog"
import type { EventoDTO } from "./queries"

type EventoCardProps = {
  evento: EventoDTO
}

export function EventoCard({ evento }: EventoCardProps) {
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
          <h3 className="text-xl font-semibold text-foreground">
            {evento.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tipo: {evento.type}
          </p>
          {evento.location && (
            <p className="text-sm text-muted-foreground">
              Local: {evento.location}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Data: {formatDate(evento.date)}
          </p>
          {evento.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {evento.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {evento.categorias.map((cat) => (
              <span
                key={cat.id}
                className="px-2 py-1 rounded-md bg-muted text-xs text-foreground"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border">
          <Button variant="default" size="sm" asChild>
            <Link href={`/gerente/eventos/${evento.id}/atletas`}>
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Atletas
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/gerente/eventos/editar/${evento.id}`}>
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

      <DeleteEventoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        eventoId={evento.id}
        eventoNome={evento.name}
      />
    </>
  )
}

