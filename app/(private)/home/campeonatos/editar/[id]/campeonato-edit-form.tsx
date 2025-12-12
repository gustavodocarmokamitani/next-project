"use client"

import { useState } from "react"
import { updateCampeonato } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DespesasEditForm, type DespesaItem } from "./despesas-edit-form"
import { CategoriasEditForm } from "./categorias-edit-form"
import { useRouter } from "next/navigation"
import type { CampeonatoDTO } from "../../queries"

type CategoriaGlobal = {
  id: string
  nome: string
  tipo: "global"
}

type CategoriaOrganizacao = {
  id: string
  nome: string
  tipo: "organizacao"
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
  categoriasGlobais: CategoriaGlobal[]
  categoriasOrganizacao: CategoriaOrganizacao[]
  categoriasGlobaisSelecionadas: string[]
  categoriasOrganizacaoSelecionadas: string[]
  categoriasCustom: Array<{ id: string; nome: string; allowUpgrade: boolean }>
  despesasIniciais: DespesaInicial[]
}

export function CampeonatoEditForm({
  campeonato,
  categoriasGlobais,
  categoriasOrganizacao,
  categoriasGlobaisSelecionadas: globaisIniciais,
  categoriasOrganizacaoSelecionadas: organizacaoIniciais,
  categoriasCustom: customIniciais,
  despesasIniciais,
}: CampeonatoEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoriasState, setCategoriasState] = useState<{
    globais: string[]
    organizacao: string[]
    custom: Array<{ id: string; nome: string; allowUpgrade: boolean; isNew?: boolean; isDeleted?: boolean; isEdited?: boolean }>
  }>({
    globais: globaisIniciais,
    organizacao: organizacaoIniciais,
    custom: customIniciais.map((c) => ({ ...c, isNew: false, isDeleted: false, isEdited: false })),
  })
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
        // Categorias globais e organizacionais (com categoryId)
        categoriasState.globais.forEach((categoriaId) => {
          formData.append("categorias", categoriaId)
        })
        categoriasState.organizacao.forEach((categoriaId) => {
          formData.append("categorias", categoriaId)
        })
        
        // Categorias custom (existentes e novas)
        categoriasState.custom
          .filter((c) => !c.isDeleted)
          .forEach((custom, index) => {
            formData.append(`categoriasCustom[${index}][id]`, custom.id)
            formData.append(`categoriasCustom[${index}][nome]`, custom.nome)
            formData.append(`categoriasCustom[${index}][allowUpgrade]`, custom.allowUpgrade ? "true" : "false")
            formData.append(`categoriasCustom[${index}][isNew]`, custom.isNew ? "true" : "false")
            formData.append(`categoriasCustom[${index}][isDeleted]`, custom.isDeleted ? "true" : "false")
            formData.append(`categoriasCustom[${index}][isEdited]`, custom.isEdited ? "true" : "false")
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

        {/* Seção de Categorias */}
        <div className="pt-4 border-t border-border">
          <CategoriasEditForm
            categoriasGlobais={categoriasGlobais}
            categoriasOrganizacao={categoriasOrganizacao}
            categoriasGlobaisSelecionadas={globaisIniciais}
            categoriasOrganizacaoSelecionadas={organizacaoIniciais}
            categoriasCustom={customIniciais}
            onCategoriasChange={setCategoriasState}
          />
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

