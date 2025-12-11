"use client"

import { useState, useMemo } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  DollarSign,
  ShoppingCart,
  MapPin,
  Calendar,
  MessageSquare,
  Search,
  AlertTriangle,
} from "lucide-react"

interface ItemPago {
  nome: string
  quantidade: number
}

interface Atleta {
  nome: string
  confirmado: boolean
  pago: boolean
  itensPagos: ItemPago[]
  itensConfirmados: {
    nome: string
    quantidadeConfirmada: number
    quantidadePaga: number
  }[]
  temDiscrepancia: boolean
}

interface Evento {
  id: string
  nome: string
  local: string
  data: Date | string
  comentario: string | null
  categorias: { id: string; name: string }[]
  atletasConfirmados: number
  atletasPagos: number
  valorRecebido: number
  itensPagos?: ItemPago[]
  atletas: Atleta[]
}

interface AnalyticsContentProps {
  eventos: Evento[]
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

export function AnalyticsContent({ eventos }: AnalyticsContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [athleteSearch, setAthleteSearch] = useState<Record<string, string>>({})

  const eventosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) {
      return eventos
    }

    const termo = searchTerm.toLowerCase().trim()
    return eventos.filter((evento) => {
      const nomeMatch = evento.nome.toLowerCase().includes(termo)
      const dataStr = formatDate(evento.data)
      const dataMatch = dataStr.toLowerCase().includes(termo)
      const localMatch = evento.local.toLowerCase().includes(termo)
      const categoriasStr = evento.categorias.map((c) => c.name).join(" ").toLowerCase()
      const categoriasMatch = categoriasStr.includes(termo)
      return nomeMatch || dataMatch || localMatch || categoriasMatch
    })
  }, [eventos, searchTerm])

  const eventosPorCategoria = useMemo(() => {
    const categorias = new Map<string, Evento[]>()
    eventosFiltrados.forEach((evento) => {
      // Um evento pode ter múltiplas categorias, então aparece em cada uma
      evento.categorias.forEach((cat) => {
        const eventosCategoria = categorias.get(cat.name) || []
        // Evita duplicatas se o evento já estiver na categoria
        if (!eventosCategoria.some((e) => e.id === evento.id)) {
          eventosCategoria.push(evento)
          categorias.set(cat.name, eventosCategoria)
        }
      })
      // Se o evento não tiver categorias, coloca em uma categoria especial
      if (evento.categorias.length === 0) {
        const eventosCategoria = categorias.get("Sem categoria") || []
        if (!eventosCategoria.some((e) => e.id === evento.id)) {
          eventosCategoria.push(evento)
          categorias.set("Sem categoria", eventosCategoria)
        }
      }
    })
    return categorias
  }, [eventosFiltrados])

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Eventos</h2>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, data ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Sections */}
      {eventosPorCategoria.size === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum evento encontrado
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {Array.from(eventosPorCategoria.entries()).map(([categoria, eventosCat]) => (
            <AccordionItem
              key={categoria}
              value={categoria.toLowerCase()}
              className="border border-border rounded-lg px-4"
            >
              <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                {categoria}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  {eventosCat.map((evento) => (
                    <div
                      key={evento.id}
                      className="rounded-lg border border-border bg-card p-6 space-y-4"
                    >
                      {/* Event Header */}
                      <div className="space-y-3">
                        <h4 className="text-xl font-semibold text-foreground">
                          {evento.nome}
                        </h4>

                        {/* Comentário/Observação */}
                        {evento.comentario && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span className="flex-1">{evento.comentario}</span>
                          </div>
                        )}

                        {/* Local */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" />
                          <span>{evento.local}</span>
                        </div>

                        {/* Data */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-purple-500" />
                          <span>{formatDate(evento.data)}</span>
                        </div>

                        {/* Categorias */}
                        {evento.categorias.length > 0 && (
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
                        )}
                      </div>

                      {/* Event Metrics */}
                      <div className="space-y-3 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-foreground">
                            Atletas Confirmados: {evento.atletasConfirmados}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-foreground">
                            Atletas Pagos: {evento.atletasPagos}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-orange-500" />
                          <span className="text-sm text-foreground">
                            Valor Recebido: {formatarValor(evento.valorRecebido)}
                          </span>
                        </div>
                      </div>

                      {/* Paid Items Summary (if exists) */}
                      {evento.itensPagos && evento.itensPagos.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-border">
                          <h5 className="text-sm font-semibold text-foreground">
                            Itens Pagos
                          </h5>
                          <div className="space-y-1">
                            {evento.itensPagos.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">
                                  {item.nome}: {item.quantidade}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Athlete List */}
                      <div className="space-y-2 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-foreground">
                            Lista de Atletas
                          </h5>
                        </div>
                        
                        {/* Search Input for Athletes */}
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Buscar atleta..."
                            value={athleteSearch[evento.id] || ""}
                            onChange={(e) =>
                              setAthleteSearch((prev) => ({
                                ...prev,
                                [evento.id]: e.target.value,
                              }))
                            }
                            className="pl-10"
                          />
                        </div>

                        <Accordion type="multiple" className="w-full space-y-2">
                          {evento.atletas
                            .filter((atleta) => {
                              const search = athleteSearch[evento.id]?.toLowerCase() || ""
                              if (!search) return true
                              return atleta.nome.toLowerCase().includes(search)
                            })
                            .map((atleta, idx) => (
                              <AccordionItem
                                key={idx}
                                value={`atleta-${evento.id}-${idx}`}
                                className="border border-border rounded-lg px-3"
                              >
                                <AccordionTrigger className="hover:no-underline py-2">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <span className="text-sm text-foreground font-medium">
                                      {atleta.nome}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {atleta.confirmado && (
                                        <>
                                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          <span className="text-xs text-green-500">
                                            Confirmado
                                          </span>
                                        </>
                                      )}
                                      {atleta.pago ? (
                                        <>
                                          <span className="text-xs text-muted-foreground">
                                            |
                                          </span>
                                          <DollarSign className="h-4 w-4 text-green-500" />
                                          <span className="text-xs text-green-500">
                                            Pago
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-xs text-muted-foreground">
                                            |
                                          </span>
                                          <span className="text-xs text-orange-500">
                                            Pendente
                                          </span>
                                        </>
                                      )}
                                      {atleta.temDiscrepancia && (
                                        <>
                                          <span className="text-xs text-muted-foreground">
                                            |
                                          </span>
                                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                                          <span className="text-xs text-orange-500">
                                            Discrepância
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  {atleta.itensConfirmados.length > 0 ? (
                                    <div className="text-xs text-muted-foreground pl-2 pt-2 space-y-2">
                                      {atleta.itensConfirmados.map((item, itemIdx) => {
                                        const temDiscrepancia =
                                          item.quantidadePaga !== item.quantidadeConfirmada
                                        return (
                                          <div
                                            key={itemIdx}
                                            className={`flex items-center justify-between gap-2 p-2 rounded ${
                                              temDiscrepancia
                                                ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 flex-1">
                                              <ShoppingCart className="h-3 w-3" />
                                              <span className="font-medium text-foreground">
                                                {item.nome}:
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span
                                                className={
                                                  temDiscrepancia
                                                    ? "text-orange-600 dark:text-orange-400"
                                                    : ""
                                                }
                                              >
                                                Confirmado: {item.quantidadeConfirmada}
                                              </span>
                                              <span className="text-muted-foreground">|</span>
                                              <span
                                                className={
                                                  temDiscrepancia
                                                    ? "text-orange-600 dark:text-orange-400 font-semibold"
                                                    : ""
                                                }
                                              >
                                                Pago: {item.quantidadePaga}
                                              </span>
                                              {temDiscrepancia && (
                                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground pl-2 pt-2">
                                      Nenhum item confirmado ou pago.
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                        </Accordion>

                        {evento.atletas.filter((atleta) => {
                          const search = athleteSearch[evento.id]?.toLowerCase() || ""
                          if (!search) return true
                          return atleta.nome.toLowerCase().includes(search)
                        }).length === 0 && (
                          <div className="text-center py-4 text-xs text-muted-foreground">
                            Nenhum atleta encontrado
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

