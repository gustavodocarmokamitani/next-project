"use client"

import { useState } from "react"
import { createEventoGerente } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import Link from "next/link"
import { ChevronDown, Info } from "lucide-react"

interface Categoria {
  id: string
  nome: string
}

interface TipoEvento {
  id: string
  nome: string
}

interface EventoFormProps {
  categorias: Categoria[]
  tiposEvento: TipoEvento[]
}

export function EventoForm({ categorias, tiposEvento }: EventoFormProps) {
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<
    string[]
  >([])

  return (
    <form action={createEventoGerente} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Dados do Evento
        </h2>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Evento *</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input id="data" name="data" type="date" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input id="local" name="local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo do Evento *</Label>
            <div className="relative">
              <select
                id="tipo"
                name="tipo"
                required
                className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
              >
                <option value="">Selecione o tipo</option>
                {tiposEvento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorias">Categorias</Label>
          <MultiSelect
            options={categorias}
            selected={categoriasSelecionadas}
            onChange={setCategoriasSelecionadas}
            placeholder="Selecione as categorias..."
          />
          {/* Hidden input para enviar os valores selecionados no form */}
          {categoriasSelecionadas.map((catId) => (
            <input key={catId} type="hidden" name="categorias" value={catId} />
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Info sobre criação automática de despesa */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                Pagamento será criado automaticamente
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Um pagamento será criado automaticamente para este evento. Você será redirecionado para adicionar os itens após criar o evento.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Salvar
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/gerente/eventos">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}

