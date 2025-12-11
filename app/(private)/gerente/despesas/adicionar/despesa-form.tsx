"use client"

import { useState } from "react"
import { createDespesaGerente } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import Link from "next/link"

type Categoria = {
  id: string
  nome: string
}

type Evento = {
  id: string
  name: string
  categorias: { id: string; name: string }[]
}

type DespesaFormProps = {
  categorias: Categoria[]
  eventos: Evento[]
}

export function DespesaForm({ categorias, eventos }: DespesaFormProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("")

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId)
  }

  const selectedEvent = selectedEventId
    ? eventos.find((e) => e.id === selectedEventId)
    : null

  return (
    <form action={createDespesaGerente} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Dados da Despesa
        </h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Despesa *</Label>
          <Input id="nome" name="nome" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evento">Evento Associado (Opcional)</Label>
          <div className="relative">
            <select
              id="evento"
              name="evento"
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
            >
              <option value="">Nenhum evento</option>
              {eventos.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {selectedEvent && selectedEvent.categorias.length > 0 && (
            <div className="mt-2 p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">
                Categorias do evento (serão associadas automaticamente):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.categorias.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {selectedEvent && selectedEvent.categorias.length === 0 && (
            <p className="text-xs text-orange-500">
              O evento selecionado não possui categorias associadas. Selecione outro evento ou nenhum evento.
            </p>
          )}
        </div>

        {!selectedEventId && (
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <div className="relative">
              <select
                id="categoria"
                name="categoria"
                required={!selectedEventId}
                className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione uma categoria quando não houver evento associado
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="vencimento">Data de Vencimento *</Label>
          <Input id="vencimento" name="vencimento" type="date" required />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Criar e Adicionar Itens
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/gerente/despesas">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}

