"use client"

import { useState, useEffect } from "react"
import { createCampeonato } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { DespesasCampeonatoForm, type DespesaItem } from "./despesas-campeonato-form"
import { CategoriasCampeonatoForm } from "./categorias-campeonato-form"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Organization = {
  id: string
  name: string
}

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

type CampeonatoFormProps = {
  categoriasGlobais: CategoriaGlobal[]
  categoriasOrganizacao: CategoriaOrganizacao[]
}

export function CampeonatoForm({ categoriasGlobais, categoriasOrganizacao }: CampeonatoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSystem, setIsSystem] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("")
  const [despesas, setDespesas] = useState<DespesaItem[]>([])
  const [categoriasState, setCategoriasState] = useState<{
    globais: string[]
    organizacao: string[]
    custom: Array<{ id: string; nome: string; allowUpgrade: boolean }>
  }>({
    globais: [],
    organizacao: [],
    custom: [],
  })

  useEffect(() => {
    // Verifica se é SYSTEM e busca organizações
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === "SYSTEM") {
          setIsSystem(true)
          // Buscar organizações
          fetch("/api/sistema/organizacoes")
            .then((res) => res.json())
            .then((orgs) => {
              setOrganizations(orgs)
              if (orgs.length > 0) {
                setSelectedOrganizationId(orgs[0].id)
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  return (
    <form
      action={async (formData) => {
        if (isSystem && selectedOrganizationId) {
          formData.append("organizerId", selectedOrganizationId)
        }
        
        // Adiciona as categorias ao FormData
        // Categorias globais e organizacionais (com categoryId)
        categoriasState.globais.forEach((categoriaId) => {
          formData.append("categorias", categoriaId)
        })
        categoriasState.organizacao.forEach((categoriaId) => {
          formData.append("categorias", categoriaId)
        })
        
        // Categorias custom (sem categoryId, apenas nome e allowUpgrade)
        categoriasState.custom.forEach((custom, index) => {
          formData.append(`categoriasCustom[${index}][nome]`, custom.nome)
          formData.append(`categoriasCustom[${index}][allowUpgrade]`, custom.allowUpgrade ? "true" : "false")
        })
        
        // Adiciona as despesas ao FormData
        despesas.forEach((despesa, index) => {
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
        })
        
        setIsSubmitting(true)
        await createCampeonato(formData)
        setIsSubmitting(false)
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Seletor de Organização (apenas para SYSTEM) */}
        {isSystem && (
          <div className="space-y-2">
            <Label htmlFor="organizerId">Organização Organizadora *</Label>
            <input
              type="hidden"
              id="organizerId"
              name="organizerId"
              value={selectedOrganizationId}
            />
            <Combobox
              options={organizations.map((org) => ({
                value: org.id,
                label: org.name,
              }))}
              value={selectedOrganizationId}
              onValueChange={setSelectedOrganizationId}
              placeholder="Selecione uma organização"
              searchPlaceholder="Buscar organização..."
              emptyMessage="Nenhuma organização encontrada."
            />
            <p className="text-xs text-muted-foreground">
              Selecione a organização que será a organizadora deste campeonato
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Campeonato *</Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Ex: Campeonato Brasileiro 2025"
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
            placeholder="Descreva o campeonato, regras, formato, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início *</Label>
            <Input
              id="dataInicio"
              name="dataInicio"
              type="datetime-local"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataFim">Data de Fim (opcional)</Label>
            <Input
              id="dataFim"
              name="dataFim"
              type="datetime-local"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="local">Local</Label>
          <Input
            id="local"
            name="local"
            placeholder="Ex: Ginásio Municipal, São Paulo - SP"
          />
        </div>

        {/* Seção de Categorias */}
        <div className="pt-4 border-t border-border">
          <CategoriasCampeonatoForm
            categoriasGlobais={categoriasGlobais}
            categoriasOrganizacao={categoriasOrganizacao}
            onCategoriasChange={setCategoriasState}
          />
        </div>
      </div>

      {/* Seção de Despesas */}
      <div className="pt-6 border-t border-border">
        <DespesasCampeonatoForm onDespesasChange={setDespesas} />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Campeonato"}
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

