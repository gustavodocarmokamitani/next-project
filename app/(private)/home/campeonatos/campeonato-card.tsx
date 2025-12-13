"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Trophy, Calendar, MapPin, Layers, Mail, BarChart3, Link2 } from "lucide-react"
import { DeleteCampeonatoDialog } from "./delete-campeonato-dialog"
import type { CampeonatoDTO } from "./queries"

type CampeonatoCardProps = {
  campeonato: CampeonatoDTO
}

export function CampeonatoCard({ campeonato }: CampeonatoCardProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  const handleGerarLink = () => {
    router.push(`/home/campeonatos/${campeonato.id}/convites`)
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">
              {campeonato.nome}
            </h3>
            {campeonato.descricao && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {campeonato.descricao}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(campeonato.dataInicio)}
              {campeonato.dataFim && ` - ${formatDate(campeonato.dataFim)}`}
            </span>
          </div>
          {campeonato.local && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{campeonato.local}</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Organizador: {campeonato.organizador.nome}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border">
          <Button variant="default" size="sm" asChild>
            <Link href={`/home/campeonatos/${campeonato.id}/analytics`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href={`/home/campeonatos/${campeonato.id}/convites`}>
              <Mail className="h-4 w-4 mr-2" />
              Gerenciar Convites
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/home/campeonatos/editar/${campeonato.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGerarLink}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Gerar Link de Convite
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

      <DeleteCampeonatoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        campeonatoId={campeonato.id}
        campeonatoNome={campeonato.nome}
      />
    </>
  )
}

