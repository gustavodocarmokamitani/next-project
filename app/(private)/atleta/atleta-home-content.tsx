"use client"

import { useState, useMemo } from "react"
import { Calendar, MapPin, CheckCircle2, DollarSign, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { confirmarPresenca, pagarDespesa } from "./actions"
import { EventoAtletaDTO, DespesaAtletaDTO } from "./queries"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchInput } from "@/app/components/search-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AtletaHomeContentProps = {
  eventos: EventoAtletaDTO[]
  despesas: DespesaAtletaDTO[]
  athleteId: string
}

const formatDate = (date: Date | string) => {
  if (typeof date === "string") {
    return date
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const formatValor = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

const ITEMS_PER_PAGE = 5

export function AtletaHomeContent({ eventos, despesas, athleteId }: AtletaHomeContentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [searchEventos, setSearchEventos] = useState("")
  const [searchDespesas, setSearchDespesas] = useState("")
  const [pageEventos, setPageEventos] = useState(1)
  const [pageDespesas, setPageDespesas] = useState(1)

  const handleConfirmarPresenca = async (
    eventId: string,
    items?: { itemId: string; quantity: number }[],
  ) => {
    setLoading(`confirm-${eventId}`)
    try {
      await confirmarPresenca(eventId, items)
      router.refresh()
    } catch (error) {
      console.error("Erro ao confirmar presença:", error)
    } finally {
      setLoading(null)
    }
  }

  const handlePagarDespesa = async (
    paymentId: string,
    items: { itemId: string; quantity: number }[],
  ) => {
    setLoading(`pay-${paymentId}`)
    try {
      await pagarDespesa(paymentId, items)
      router.refresh()
    } catch (error) {
      console.error("Erro ao pagar despesa:", error)
    } finally {
      setLoading(null)
    }
  }

  // Filtra eventos
  const eventosFiltrados = useMemo(() => {
    if (!searchEventos.trim()) {
      return eventos
    }

    const term = searchEventos.toLowerCase().trim()
    return eventos.filter((evento) => {
      const nome = evento.name.toLowerCase()
      const descricao = evento.description?.toLowerCase() || ""
      const local = evento.location?.toLowerCase() || ""
      const tipo = evento.type.toLowerCase()
      const data = formatDate(evento.date).toLowerCase()
      const categorias = evento.categorias.map((c) => c.name).join(" ").toLowerCase()

      return (
        nome.includes(term) ||
        descricao.includes(term) ||
        local.includes(term) ||
        tipo.includes(term) ||
        data.includes(term) ||
        categorias.includes(term)
      )
    })
  }, [eventos, searchEventos])

  // Filtra despesas
  const despesasFiltradas = useMemo(() => {
    if (!searchDespesas.trim()) {
      return despesas
    }

    const term = searchDespesas.toLowerCase().trim()
    return despesas.filter((despesa) => {
      const nome = despesa.name.toLowerCase()
      const evento = despesa.event?.name.toLowerCase() || ""
      const vencimento = formatDate(despesa.dueDate).toLowerCase()
      const itens = despesa.items.map((i) => i.name).join(" ").toLowerCase()

      return (
        nome.includes(term) ||
        evento.includes(term) ||
        vencimento.includes(term) ||
        itens.includes(term)
      )
    })
  }, [despesas, searchDespesas])

  // Paginação de eventos
  const totalPagesEventos = Math.ceil(eventosFiltrados.length / ITEMS_PER_PAGE)
  const eventosPaginados = eventosFiltrados.slice(
    (pageEventos - 1) * ITEMS_PER_PAGE,
    pageEventos * ITEMS_PER_PAGE,
  )

  // Paginação de despesas
  const totalPagesDespesas = Math.ceil(despesasFiltradas.length / ITEMS_PER_PAGE)
  const despesasPaginadas = despesasFiltradas.slice(
    (pageDespesas - 1) * ITEMS_PER_PAGE,
    pageDespesas * ITEMS_PER_PAGE,
  )

  // Reseta página quando busca muda
  const handleSearchEventosChange = (value: string) => {
    setSearchEventos(value)
    setPageEventos(1)
  }

  const handleSearchDespesasChange = (value: string) => {
    setSearchDespesas(value)
    setPageDespesas(1)
  }

  return (
    <div className="space-y-8">
      {/* Eventos */}
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Eventos</h2>
        <div className="mb-6">
          <SearchInput
            placeholder="Buscar eventos por nome, data, local, tipo..."
            value={searchEventos}
            onChange={handleSearchEventosChange}
          />
        </div>
        
        {eventos.length === 0 ? (
          <p className="text-muted-foreground">Nenhum evento disponível no momento.</p>
        ) : eventosFiltrados.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum evento encontrado com o termo de busca.
          </p>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {eventosPaginados.map((evento) => (
              <div
                key={evento.id}
                className="rounded-lg border border-border bg-card p-6 space-y-4"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{evento.name}</h3>
                  
                  {evento.description && (
                    <p className="text-sm text-muted-foreground">{evento.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(evento.date)}</span>
                    </div>
                    {evento.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{evento.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md bg-muted text-xs">
                        {evento.type}
                      </span>
                    </div>
                  </div>

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

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    {evento.confirmed ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">
                          Presença Confirmada
                        </span>
                        {evento.confirmedAt && (
                          <span className="text-xs text-muted-foreground">
                            em {formatDate(evento.confirmedAt)}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Presença não confirmada
                        </span>
                      </>
                    )}
                  </div>
                  
                  {!evento.confirmed && (
                    <ConfirmarPresencaDialog
                      evento={evento}
                      onConfirm={handleConfirmarPresenca}
                      loading={loading === `confirm-${evento.id}`}
                    />
                  )}
                </div>
              </div>
              ))}
            </div>

            {/* Paginação Eventos */}
            {eventosFiltrados.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {pageEventos} de {totalPagesEventos} ({eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? "s" : ""})
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageEventos((p) => Math.max(1, p - 1))}
                    disabled={pageEventos === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageEventos((p) => Math.min(totalPagesEventos, p + 1))}
                    disabled={pageEventos === totalPagesEventos}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Despesas */}
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Despesas</h2>
        <div className="mb-6">
          <SearchInput
            placeholder="Buscar despesas por nome, evento, itens..."
            value={searchDespesas}
            onChange={handleSearchDespesasChange}
          />
        </div>
        
        {despesas.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma despesa disponível no momento.</p>
        ) : despesasFiltradas.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhuma despesa encontrada com o termo de busca.
          </p>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {despesasPaginadas.map((despesa) => (
              <div
                key={despesa.id}
                className="rounded-lg border border-border bg-card p-6 space-y-4"
              >
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{despesa.name}</h3>
                  {despesa.event && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Evento: {despesa.event.name}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Vencimento: {formatDate(despesa.dueDate)}
                  </p>
                </div>

                {despesa.paid ? (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-500">
                          Despesa paga com sucesso
                        </p>
                        {despesa.paidAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Paga em {formatDate(despesa.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-foreground">Itens pagos:</p>
                      {despesa.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} {item.quantity > 1 && `(${item.quantity}x)`}
                          </span>
                          <span className="font-medium">
                            {formatValor(item.value * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 border-t border-border font-semibold">
                        <span>Total:</span>
                        <span>
                          {formatValor(
                            despesa.items.reduce(
                              (sum, item) => sum + item.value * item.quantity,
                              0,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DespesaPagamentoForm
                    despesa={despesa}
                    onPay={handlePagarDespesa}
                    loading={loading === `pay-${despesa.id}`}
                  />
                )}
              </div>
              ))}
            </div>

            {/* Paginação Despesas */}
            {despesasFiltradas.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {pageDespesas} de {totalPagesDespesas} ({despesasFiltradas.length} despesa{despesasFiltradas.length !== 1 ? "s" : ""})
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageDespesas((p) => Math.max(1, p - 1))}
                    disabled={pageDespesas === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageDespesas((p) => Math.min(totalPagesDespesas, p + 1))}
                    disabled={pageDespesas === totalPagesDespesas}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function DespesaPagamentoForm({
  despesa,
  onPay,
  loading,
}: {
  despesa: DespesaAtletaDTO
  onPay: (paymentId: string, items: { itemId: string; quantity: number }[]) => void
  loading: boolean
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    despesa.items.forEach((item) => {
      initial[item.id] = item.required ? 1 : 0
    })
    return initial
  })

  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, value),
    }))
  }

  const handlePay = () => {
    const items = despesa.items
      .filter((item) => {
        // Itens obrigatórios devem ter quantidade >= 1
        if (item.required) {
          return quantities[item.id] >= 1
        }
        // Itens não obrigatórios só se quantidade > 0
        return quantities[item.id] > 0
      })
      .map((item) => ({
        itemId: item.id,
        quantity: quantities[item.id] || (item.required ? 1 : 0),
      }))

    if (items.length > 0) {
      onPay(despesa.id, items)
    }
  }

  const totalValue = despesa.items.reduce((sum, item) => {
    const qty = quantities[item.id] || (item.required ? 1 : 0)
    return sum + item.value * qty
  }, 0)

  const hasRequiredItems = despesa.items.some((item) => item.required)
  const allRequiredSelected = hasRequiredItems
    ? despesa.items
        .filter((item) => item.required)
        .every((item) => (quantities[item.id] || 0) >= 1)
    : true

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div className="space-y-3">
        {despesa.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between p-4 rounded-lg border border-border bg-muted/30"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-foreground">{item.name}</span>
                {item.required && (
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-500 text-xs">
                    Obrigatório
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatValor(item.value)} {item.quantityEnabled && "por unidade"}
              </p>
            </div>

            <div className="flex items-center gap-3 ml-4">
              {item.quantityEnabled ? (
                <div className="flex items-center gap-2">
                  <Label htmlFor={`quantity-${item.id}`} className="text-sm">
                    Qtd:
                  </Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min={item.required ? 1 : 0}
                    value={quantities[item.id] || (item.required ? 1 : 0)}
                    onChange={(e) =>
                      handleQuantityChange(item.id, Number(e.target.value))
                    }
                    className="w-20"
                    disabled={loading}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Incluído</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
        <span className="font-semibold text-foreground">Total:</span>
        <span className="text-xl font-bold text-primary">{formatValor(totalValue)}</span>
      </div>

      <Button
        onClick={handlePay}
        disabled={loading || !allRequiredSelected || totalValue === 0}
        className="w-full"
        size="lg"
      >
        {loading ? "Processando pagamento..." : "Pagar Despesa"}
      </Button>

      {!allRequiredSelected && (
        <p className="text-xs text-orange-500 text-center">
          Todos os itens obrigatórios devem ser selecionados
        </p>
      )}
    </div>
  )
}

type ConfirmarPresencaDialogProps = {
  evento: EventoAtletaDTO
  onConfirm: (eventId: string, items?: { itemId: string; quantity: number }[]) => Promise<void>
  loading: boolean
}

function ConfirmarPresencaDialog({
  evento,
  onConfirm,
  loading,
}: ConfirmarPresencaDialogProps) {
  const [open, setOpen] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    evento.paymentItems.forEach((item) => {
      initial[item.id] = item.required ? 1 : 0
    })
    return initial
  })

  const handleQuantityChange = (itemId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, value),
    }))
  }

  const handleConfirm = async () => {
    const items = evento.paymentItems
      .filter((item) => {
        // Itens obrigatórios devem ter quantidade >= 1
        if (item.required) {
          return quantities[item.id] >= 1
        }
        // Itens não obrigatórios só se quantidade > 0
        return quantities[item.id] > 0
      })
      .map((item) => ({
        itemId: item.id,
        quantity: quantities[item.id] || (item.required ? 1 : 0),
      }))

    // Se não houver itens, confirma sem itens
    await onConfirm(evento.id, items.length > 0 ? items : undefined)
    setOpen(false)
  }

  const totalValue = evento.paymentItems.reduce((sum, item) => {
    const qty = quantities[item.id] || (item.required ? 1 : 0)
    return sum + item.value * qty
  }, 0)

  const hasRequiredItems = evento.paymentItems.some((item) => item.required)
  const allRequiredSelected = hasRequiredItems
    ? evento.paymentItems
        .filter((item) => item.required)
        .every((item) => (quantities[item.id] || 0) >= 1)
    : true

  // Se não houver itens, confirma diretamente
  if (evento.paymentItems.length === 0) {
    return (
      <Button
        onClick={() => onConfirm(evento.id)}
        disabled={loading}
        size="sm"
      >
        {loading ? "Confirmando..." : "Confirmar Presença"}
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={loading}
        size="sm"
      >
        Confirmar Presença
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmar Presença no Evento</DialogTitle>
            <DialogDescription>
              Selecione os itens que você deseja para este evento: {evento.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {evento.paymentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`item-${item.id}`} className="text-sm font-semibold">
                      {item.name}
                      {item.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatValor(item.value)}
                    {item.quantityEnabled && " por unidade"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {item.quantityEnabled ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            Math.max(0, (quantities[item.id] || 0) - 1),
                          )
                        }
                        disabled={!item.required && (quantities[item.id] || 0) === 0}
                      >
                        -
                      </Button>
                      <Input
                        id={`item-${item.id}`}
                        type="number"
                        min={item.required ? 1 : 0}
                        value={quantities[item.id] || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0
                          handleQuantityChange(item.id, Math.max(item.required ? 1 : 0, value))
                        }}
                        className="w-20 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item.id, (quantities[item.id] || 0) + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                  ) : (
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={(quantities[item.id] || 0) >= 1}
                      onCheckedChange={(checked) => {
                        handleQuantityChange(item.id, checked ? 1 : 0)
                      }}
                      disabled={item.required}
                    />
                  )}

                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-semibold text-foreground">
                      {formatValor(item.value * (quantities[item.id] || (item.required ? 1 : 0)))}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {formatValor(totalValue)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !allRequiredSelected}
            >
              {loading ? "Confirmando..." : "Confirmar Presença"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
