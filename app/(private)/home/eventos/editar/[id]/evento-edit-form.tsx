"use client"

import { useState } from "react"
import { updateEvento } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { EventoDTO } from "../../queries"

interface Categoria {
  id: string
  nome: string
}

interface TipoEvento {
  id: string
  nome: string
}

interface EventoEditFormProps {
  evento: EventoDTO
  categorias: Categoria[]
  tiposEvento: TipoEvento[]
  dateFormatted: string
}

export function EventoEditForm({
  evento,
  categorias,
  tiposEvento,
  dateFormatted,
}: EventoEditFormProps) {
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>(
    evento.categorias.map((cat) => cat.id),
  )

  return (
    <form action={updateEvento} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Dados do Evento
        </h2>
      </div>

      <input type="hidden" name="id" value={evento.id} />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Evento *</Label>
            <Input
              id="nome"
              name="nome"
              defaultValue={evento.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              name="data"
              type="date"
              defaultValue={dateFormatted}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              name="local"
              defaultValue={evento.location || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo do Evento *</Label>
            <div className="relative">
              <select
                id="tipo"
                name="tipo"
                required
                defaultValue={evento.type}
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
            defaultValue={evento.description || ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Salvar
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/home/eventos">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}

