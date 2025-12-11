"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatValor } from "@/lib/format-valor"
import { formatDate } from "@/lib/format-date"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Search, UserCheck, DollarSign } from "lucide-react"
import { confirmarPresencaAtleta, cancelarPresencaAtleta, registrarPagamentoAtleta } from "./actions"
import { EventoDetalhesDTO, AtletaEventoDTO } from "./queries"

type AtletasEventoContentProps = {
  evento: EventoDetalhesDTO
  atletas: AtletaEventoDTO[]
  success?: string
  error?: string
}

export function AtletasEventoContent({
  evento,
  atletas,
  success,
  error,
}: AtletasEventoContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedAtleta, setSelectedAtleta] = useState<AtletaEventoDTO | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [paymentQuantities, setPaymentQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const filteredAtletas = atletas.filter(
    (atleta) =>
      `${atleta.firstName} ${atleta.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      atleta.phone.includes(search) ||
      (atleta.shirtNumber && atleta.shirtNumber.includes(search)),
  )

  const handleOpenConfirmDialog = (atleta: AtletaEventoDTO) => {
    setSelectedAtleta(atleta)
    const initialQuantities: Record<string, number> = {}
    evento.paymentItems.forEach((item) => {
      const athleteItem = atleta.paymentItems.find((pi) => pi.id === item.id)
      initialQuantities[item.id] = athleteItem?.confirmedQuantity || (item.required ? 1 : 0)
    })
    setQuantities(initialQuantities)
    setConfirmDialogOpen(true)
  }

  const handleOpenPaymentDialog = (atleta: AtletaEventoDTO) => {
    setSelectedAtleta(atleta)
    const initialQuantities: Record<string, number> = {}
    evento.paymentItems.forEach((item) => {
      const athleteItem = atleta.paymentItems.find((pi) => pi.id === item.id)
      initialQuantities[item.id] = athleteItem?.paidQuantity || (item.required ? 1 : 0)
    })
    setPaymentQuantities(initialQuantities)
    setPaymentDialogOpen(true)
  }

  const handleConfirmPresence = async () => {
    if (!selectedAtleta) return

    setLoading(true)
    try {
      const items = evento.paymentItems
        .filter((item) => {
          const qty = quantities[item.id] || 0
          return qty > 0
        })
        .map((item) => ({
          itemId: item.id,
          quantity: quantities[item.id] || 0,
        }))

      await confirmarPresencaAtleta(evento.id, selectedAtleta.id, items)
      router.refresh()
    } catch (error) {
      console.error("Erro ao confirmar presença:", error)
    } finally {
      setLoading(false)
      setConfirmDialogOpen(false)
    }
  }

  const handleCancelPresence = async (atleta: AtletaEventoDTO) => {
    if (!confirm("Deseja realmente cancelar a presença deste atleta?")) return

    setLoading(true)
    try {
      await cancelarPresencaAtleta(evento.id, atleta.id)
      router.refresh()
    } catch (error) {
      console.error("Erro ao cancelar presença:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterPayment = async () => {
    if (!selectedAtleta) return

    setLoading(true)
    try {
      const items = evento.paymentItems
        .filter((item) => {
          const qty = paymentQuantities[item.id] || 0
          return qty > 0
        })
        .map((item) => ({
          itemId: item.id,
          quantity: paymentQuantities[item.id] || 0,
        }))

      await registrarPagamentoAtleta(evento.id, selectedAtleta.id, items)
      router.refresh()
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error)
    } finally {
      setLoading(false)
      setPaymentDialogOpen(false)
    }
  }

  const allRequiredSelected = (quantitiesMap: Record<string, number>) => {
    return evento.paymentItems
      .filter((item) => item.required)
      .every((item) => (quantitiesMap[item.id] || 0) > 0)
  }

  if (success) {
    setTimeout(() => {
      router.replace(`/home/eventos/${evento.id}/atletas`)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500 text-green-500">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
          {error}
        </div>
      )}

      {/* Informações do Evento */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
           <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{evento.name}</h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Data:</strong> {formatDate(evento.date)}
              </p>
              {evento.location && (
                <p>
                  <strong>Local:</strong> {evento.location}
                </p>
              )}
              <p>
                <strong>Tipo:</strong> {evento.type}
              </p>
              {evento.description && (
                <p>
                  <strong>Descrição:</strong> {evento.description}
                </p>
              )}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-muted-foreground mb-1">Categorias</p>
            <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar atleta por nome, telefone ou número da camisa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Atletas */}
      <div className="space-y-4">
        {filteredAtletas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum atleta encontrado
          </div>
        ) : (
          filteredAtletas.map((atleta) => (
            <div
              key={atleta.id}
              className="rounded-lg border border-border bg-card p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      {atleta.firstName} {atleta.lastName}
                    </h3>
                    {atleta.shirtNumber && (
                      <span className="px-2 py-1 rounded-md bg-muted text-xs whitespace-nowrap">
                        #{atleta.shirtNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 sm:mb-4 break-all">Telefone: {atleta.phone}</p>

                  {/* Status de Presença */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                    {atleta.confirmed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-green-500 font-medium">
                          Presença Confirmada
                        </span>
                        {atleta.confirmedAt && (
                          <span className="text-xs text-muted-foreground">
                            em {formatDate(atleta.confirmedAt)}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Presença não confirmada</span>
                      </>
                    )}
                  </div>

                  {/* Itens Pagos */}
                  {atleta.paymentItems.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Itens:</p>
                      <div className="space-y-1">
                        {atleta.paymentItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm p-2 rounded bg-muted/30"
                          >
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <span className="break-words">{item.name}</span>
                              {item.quantityEnabled && (
                                <span className="text-muted-foreground text-xs whitespace-nowrap">
                                  (Qtd confirmada: {item.confirmedQuantity}, Qtd paga: {item.paidQuantity})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                              <span className="text-muted-foreground whitespace-nowrap">
                                {formatValor(
                                  item.value * (item.quantityEnabled ? item.paidQuantity : 1),
                                )}
                              </span>
                              {item.paid ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-4 w-full sm:w-auto lg:w-auto">
                  {!atleta.confirmed ? (
                    <Button
                      onClick={() => handleOpenConfirmDialog(atleta)}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Confirmar Presença</span>
                      <span className="sm:hidden">Confirmar</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCancelPresence(atleta)}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Cancelar Presença</span>
                      <span className="sm:hidden">Cancelar</span>
                    </Button>
                  )}

                  {evento.paymentItems.length > 0 && (
                    <Button
                      onClick={() => handleOpenPaymentDialog(atleta)}
                      disabled={loading}
                      size="sm"
                      variant="default"
                      className="w-full sm:w-auto"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Registrar Pagamento</span>
                      <span className="sm:hidden">Registrar</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog de Confirmar Presença */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle>Confirmar Presença</DialogTitle>
            <DialogDescription>
              Selecione as quantidades dos itens para {selectedAtleta?.firstName}{" "}
              {selectedAtleta?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {evento.paymentItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <Label htmlFor={`confirm-item-${item.id}`} className="text-sm font-semibold">
                    {item.name}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatValor(item.value)}
                    {item.quantityEnabled && " por unidade"}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.quantityEnabled ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`confirm-quantity-${item.id}`} className="text-sm whitespace-nowrap">
                        Qtd:
                      </Label>
                      <Input
                        id={`confirm-quantity-${item.id}`}
                        type="number"
                        min={item.required ? 1 : 0}
                        value={quantities[item.id] || (item.required ? 1 : 0)}
                        onChange={(e) =>
                          setQuantities({
                            ...quantities,
                            [item.id]: Number(e.target.value),
                          })
                        }
                        className="w-20"
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        checked={(quantities[item.id] || 0) > 0}
                        onChange={(e) =>
                          setQuantities({
                            ...quantities,
                            [item.id]: e.target.checked ? 1 : 0,
                          })
                        }
                        disabled={loading || item.required}
                      />
                      <Label className="text-sm whitespace-nowrap">
                        {item.required ? "Obrigatório" : "Incluir"}
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPresence} 
              disabled={loading || !allRequiredSelected(quantities)}
              className="w-full sm:w-auto"
            >
              {loading ? "Confirmando..." : "Confirmar Presença"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Registrar Pagamento */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Informe as quantidades de itens pagos por {selectedAtleta?.firstName}{" "}
              {selectedAtleta?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {evento.paymentItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <Label htmlFor={`payment-item-${item.id}`} className="text-sm font-semibold">
                    {item.name}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatValor(item.value)}
                    {item.quantityEnabled && " por unidade"}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.quantityEnabled ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`payment-quantity-${item.id}`} className="text-sm whitespace-nowrap">
                        Qtd:
                      </Label>
                      <Input
                        id={`payment-quantity-${item.id}`}
                        type="number"
                        min={item.required ? 1 : 0}
                        value={paymentQuantities[item.id] || (item.required ? 1 : 0)}
                        onChange={(e) =>
                          setPaymentQuantities({
                            ...paymentQuantities,
                            [item.id]: Number(e.target.value),
                          })
                        }
                        className="w-20"
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        checked={(paymentQuantities[item.id] || 0) > 0}
                        onChange={(e) =>
                          setPaymentQuantities({
                            ...paymentQuantities,
                            [item.id]: e.target.checked ? 1 : 0,
                          })
                        }
                        disabled={loading || item.required}
                      />
                      <Label className="text-sm whitespace-nowrap">
                        {item.required ? "Obrigatório" : "Pago"}
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(false)} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegisterPayment}
              disabled={loading || !allRequiredSelected(paymentQuantities)}
              className="w-full sm:w-auto"
            >
              {loading ? "Registrando..." : "Registrar Pagamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

