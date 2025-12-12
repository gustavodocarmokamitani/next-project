"use client"

import { useState } from "react"
import { updateCampeonato } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import { DespesasEditForm, type DespesaItem } from "./despesas-edit-form"
import { useRouter } from "next/navigation"
import type { CampeonatoDTO } from "../../queries"

type Categoria = {
  id: string
  nome: string
}

type DespesaInicial = {
  id: string
  nome: string
  valor: number
  quantityEnabled: boolean
  isFixed: boolean
  required: boolean
}

type CampeonatoEditFormProps = {
  campeonato: CampeonatoDTO
  categorias: Categoria[]
  categoriasSelecionadas: string[]
  despesasIniciais: DespesaInicial[]
}

export function CampeonatoEditForm({
  campeonato,
  categorias,
  categoriasSelecionadas: categoriasSelecionadasInicial,
  despesasIniciais,
}: CampeonatoEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>(
    categoriasSelecionadasInicial,
  )
  const [despesas, setDespesas] = useState<DespesaItem[]>([])

  // Formata data para input datetime-local
  const formatDateTimeLocal = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <form
      action={async (formData) => {
        // Adiciona as categorias ao FormData
        categoriasSelecionadas.forEach((categoriaId) => {
          formData.append("categorias", categoriaId)
        })

        // Adiciona as despesas ao FormData
        despesas.forEach((despesa, index) => {
          formData.append(`despesas[${index}][id]`, despesa.id)
          formData.append(`despesas[${index}][nome]`, despesa.nome)
          formData.append(`despesas[${index}][valor]`, despesa.valor)
          formData.append(
            `despesas[${index}][quantityEnabled]`,
            despesa.quantityEnabled ? "true" : "false",
          )
          formData.append(
            `despesas[${index}][isFixed]`,
            despesa.isFixed ? "true" : "false",
          )
          formData.append(
            `despesas[${index}][isNew]`,
            despesa.isNew ? "true" : "false",
          )
          formData.append(
            `despesas[${index}][isDeleted]`,
            despesa.isDeleted ? "true" : "false",
          )
          formData.append(
            `despesas[${index}][isEdited]`,
            despesa.isEdited ? "true" : "false",
          )
        })
        
        setIsSubmitting(true)
        await updateCampeonato(formData)
        setIsSubmitting(false)
      }}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={campeonato.id} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Campeonato *</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={campeonato.nome}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue={campeonato.descricao || ""}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início *</Label>
            <Input
              id="dataInicio"
              name="dataInicio"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(campeonato.dataInicio)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataFim">Data de Fim (opcional)</Label>
            <Input
              id="dataFim"
              name="dataFim"
              type="datetime-local"
              defaultValue={campeonato.dataFim ? formatDateTimeLocal(campeonato.dataFim) : ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="local">Local</Label>
          <Input
            id="local"
            name="local"
            defaultValue={campeonato.local || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categorias">Categorias que podem participar *</Label>
          <MultiSelect
            options={categorias}
            selected={categoriasSelecionadas}
            onChange={setCategoriasSelecionadas}
            placeholder="Selecione as categorias..."
          />
          <p className="text-xs text-muted-foreground">
            Selecione as categorias que poderão participar deste campeonato
          </p>
        </div>
      </div>

      {/* Seção de Despesas */}
      <div className="pt-6 border-t border-border">
        <DespesasEditForm
          despesasIniciais={despesasIniciais}
          onDespesasChange={setDespesas}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/home/campeonatos")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

