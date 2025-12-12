"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, MapPin, Layers, Users } from "lucide-react"
import type { CampeonatoInscricaoDTO } from "./queries"

type CampeonatoInscricaoCardProps = {
  campeonato: CampeonatoInscricaoDTO
}

export function CampeonatoInscricaoCard({
  campeonato,
}: CampeonatoInscricaoCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Layers className="h-3 w-3" />
          <span>{campeonato.categorias.length} categoria(s)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-border">
        <Button variant="default" size="sm" asChild>
          <Link href={`/home/campeonatos/inscricoes/${campeonato.id}`}>
            <Users className="h-4 w-4 mr-2" />
            Gerenciar Inscrições
          </Link>
        </Button>
      </div>
    </div>
  )
}

