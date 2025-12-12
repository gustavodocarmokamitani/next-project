import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trophy, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CampeonatoCard } from "./campeonato-card"
import type { CampeonatoDTO } from "./queries"
import type { CampeonatoInscricaoDTO } from "./inscricoes/queries"

type HistoricoCampeonatosSectionProps = {
  campeonatosOrganizados: CampeonatoDTO[]
  campeonatosInscritos: CampeonatoInscricaoDTO[]
}

export function HistoricoCampeonatosSection({
  campeonatosOrganizados,
  campeonatosInscritos,
}: HistoricoCampeonatosSectionProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  // Agrupa campeonatos por status (futuros, em andamento, finalizados)
  // Remove duplicatas (um campeonato pode estar tanto em organizados quanto em inscritos)
  const campeonatosUnicos = new Map<string, CampeonatoDTO | CampeonatoInscricaoDTO>()
  
  campeonatosOrganizados.forEach((c) => {
    campeonatosUnicos.set(c.id, c)
  })
  
  campeonatosInscritos.forEach((c) => {
    if (!campeonatosUnicos.has(c.id)) {
      campeonatosUnicos.set(c.id, c)
    }
  })

  const todosCampeonatos = Array.from(campeonatosUnicos.values())
  const agora = new Date()

  const campeonatosFuturos = todosCampeonatos.filter(
    (c) => new Date(c.dataInicio) > agora
  )

  const campeonatosEmAndamento = todosCampeonatos.filter(
    (c) =>
      new Date(c.dataInicio) <= agora &&
      (!c.dataFim || new Date(c.dataFim) >= agora),
  )

  const campeonatosFinalizados = todosCampeonatos.filter(
    (c) => c.dataFim && new Date(c.dataFim) < agora,
  )

  if (
    campeonatosFuturos.length === 0 &&
    campeonatosEmAndamento.length === 0 &&
    campeonatosFinalizados.length === 0
  ) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Histórico de Campeonatos</h2>
      </div>

      <Accordion type="multiple" className="w-full">
        {campeonatosFuturos.length > 0 && (
          <AccordionItem value="futuros">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  Futuros ({campeonatosFuturos.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {campeonatosFuturos.map((campeonato) => (
                  <CampeonatoCard key={campeonato.id} campeonato={campeonato} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {campeonatosEmAndamento.length > 0 && (
          <AccordionItem value="em-andamento">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  Em Andamento ({campeonatosEmAndamento.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {campeonatosEmAndamento.map((campeonato) => (
                  <CampeonatoCard key={campeonato.id} campeonato={campeonato} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {campeonatosFinalizados.length > 0 && (
          <AccordionItem value="finalizados">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  Finalizados ({campeonatosFinalizados.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {campeonatosFinalizados.map((campeonato) => (
                  <CampeonatoCard key={campeonato.id} campeonato={campeonato} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}

