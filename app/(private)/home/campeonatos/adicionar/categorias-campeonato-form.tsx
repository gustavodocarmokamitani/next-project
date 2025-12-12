"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select"
import { Plus, Trash2, Globe, Building2, Sparkles, X } from "lucide-react"

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

type CategoriaCustom = {
  id: string // UUID temporário
  nome: string
  allowUpgrade: boolean
}

type CategoriasCampeonatoFormProps = {
  categoriasGlobais: CategoriaGlobal[]
  categoriasOrganizacao: CategoriaOrganizacao[]
  onCategoriasChange: (categorias: {
    globais: string[]
    organizacao: string[]
    custom: CategoriaCustom[]
  }) => void
}

export function CategoriasCampeonatoForm({
  categoriasGlobais,
  categoriasOrganizacao,
  onCategoriasChange,
}: CategoriasCampeonatoFormProps) {
  const [categoriasGlobaisSelecionadas, setCategoriasGlobaisSelecionadas] = useState<string[]>([])
  const [categoriasOrganizacaoSelecionadas, setCategoriasOrganizacaoSelecionadas] = useState<string[]>([])
  const [categoriasCustom, setCategoriasCustom] = useState<CategoriaCustom[]>([])
  const [showFormCustom, setShowFormCustom] = useState(false)
  const [formCustom, setFormCustom] = useState({
    nome: "",
    allowUpgrade: false,
  })

  // Atualiza o callback sempre que houver mudanças
  const updateCallback = (
    globais: string[],
    organizacao: string[],
    custom: CategoriaCustom[]
  ) => {
    onCategoriasChange({ globais, organizacao, custom })
  }

  const handleAddCustom = () => {
    if (!formCustom.nome.trim()) {
      return
    }

    const novaCustom: CategoriaCustom = {
      id: crypto.randomUUID(),
      nome: formCustom.nome.trim(),
      allowUpgrade: formCustom.allowUpgrade,
    }

    const novasCustom = [...categoriasCustom, novaCustom]
    setCategoriasCustom(novasCustom)
    updateCallback(
      categoriasGlobaisSelecionadas,
      categoriasOrganizacaoSelecionadas,
      novasCustom
    )

    // Reset form
    setFormCustom({ nome: "", allowUpgrade: false })
    setShowFormCustom(false)
  }

  const handleRemoveCustom = (id: string) => {
    const novasCustom = categoriasCustom.filter((c) => c.id !== id)
    setCategoriasCustom(novasCustom)
    updateCallback(
      categoriasGlobaisSelecionadas,
      categoriasOrganizacaoSelecionadas,
      novasCustom
    )
  }

  const handleGlobaisChange = (selected: string[]) => {
    setCategoriasGlobaisSelecionadas(selected)
    updateCallback(selected, categoriasOrganizacaoSelecionadas, categoriasCustom)
  }

  const handleOrganizacaoChange = (selected: string[]) => {
    setCategoriasOrganizacaoSelecionadas(selected)
    updateCallback(categoriasGlobaisSelecionadas, selected, categoriasCustom)
  }

  const totalCategorias =
    categoriasGlobaisSelecionadas.length +
    categoriasOrganizacaoSelecionadas.length +
    categoriasCustom.length

  return (
    <div className="space-y-6">
      <div>
        <Label>Categorias do Campeonato *</Label>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Selecione categorias globais, da organização ou crie categorias customizadas.
          Total selecionado: <strong>{totalCategorias}</strong>
        </p>
      </div>

      {/* Categorias Globais */}
      {categoriasGlobais.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Categorias Globais</Label>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
              {categoriasGlobaisSelecionadas.length} selecionada(s)
            </span>
          </div>
              <MultiSelect
                options={categoriasGlobais}
            selected={categoriasGlobaisSelecionadas}
            onChange={handleGlobaisChange}
            placeholder="Selecione categorias globais..."
          />
          <p className="text-xs text-muted-foreground">
            Categorias globais facilitam a busca de atletas pelos gerentes
          </p>
        </div>
      )}

      {/* Categorias da Organização */}
      {categoriasOrganizacao.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Categorias da Organização</Label>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
              {categoriasOrganizacaoSelecionadas.length} selecionada(s)
            </span>
          </div>
              <MultiSelect
                options={categoriasOrganizacao}
            selected={categoriasOrganizacaoSelecionadas}
            onChange={handleOrganizacaoChange}
            placeholder="Selecione categorias da organização..."
          />
          <p className="text-xs text-muted-foreground">
            Categorias da sua organização também facilitam a busca de atletas
          </p>
        </div>
      )}

      {/* Categorias Custom */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Categorias Customizadas</Label>
            <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 text-xs">
              {categoriasCustom.length} criada(s)
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFormCustom(!showFormCustom)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Custom
          </Button>
        </div>

        {showFormCustom && (
          <Card className="p-4 space-y-4 border-2 border-primary/20">
            <div className="space-y-2">
              <Label htmlFor="custom-nome">Nome da Categoria Custom *</Label>
              <Input
                id="custom-nome"
                placeholder="Ex: Categoria Especial, Open, etc."
                value={formCustom.nome}
                onChange={(e) =>
                  setFormCustom({ ...formCustom, nome: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="custom-upgrade"
                checked={formCustom.allowUpgrade}
                onCheckedChange={(checked) =>
                  setFormCustom({ ...formCustom, allowUpgrade: checked === true })
                }
              />
              <Label
                htmlFor="custom-upgrade"
                className="text-sm font-normal cursor-pointer"
              >
                Permitir upgrade (atletas de categorias menores podem participar)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddCustom}
                className="flex-1"
                disabled={!formCustom.nome.trim()}
              >
                Adicionar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFormCustom(false)
                  setFormCustom({ nome: "", allowUpgrade: false })
                }}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {categoriasCustom.length > 0 && (
          <div className="space-y-2">
            {categoriasCustom.map((custom) => (
              <Card key={custom.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{custom.nome}</span>
                    {custom.allowUpgrade && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs">
                        Permite upgrade
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCustom(custom.id)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Categorias customizadas não facilitam busca automática de atletas, mas oferecem flexibilidade total
        </p>
      </div>

      {totalCategorias === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
          Nenhuma categoria selecionada. Selecione ou crie pelo menos uma categoria.
        </p>
      )}
    </div>
  )
}

