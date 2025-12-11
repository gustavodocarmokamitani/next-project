import { EventoAtletaDTO, DespesaAtletaDTO } from "./queries"
import { Calendar, CreditCard, AlertCircle } from "lucide-react"

type InfoCardProps = {
  eventos: EventoAtletaDTO[]
  despesas: DespesaAtletaDTO[]
}

export function InfoCard({ eventos, despesas }: InfoCardProps) {
  const eventosNaoConfirmados = eventos.filter((e) => !e.confirmed).length
  const despesasNaoPagas = despesas.filter((d) => !d.paid).length

  if (eventosNaoConfirmados === 0 && despesasNaoPagas === 0) {
    return null
  }

  return (
    <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Atenção - Pendências
          </h3>
          <div className="space-y-2">
            {eventosNaoConfirmados > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{eventosNaoConfirmados}</strong> evento
                  {eventosNaoConfirmados !== 1 ? "s" : ""} não confirmado
                  {eventosNaoConfirmados !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {despesasNaoPagas > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{despesasNaoPagas}</strong> despesa
                  {despesasNaoPagas !== 1 ? "s" : ""} não paga
                  {despesasNaoPagas !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

