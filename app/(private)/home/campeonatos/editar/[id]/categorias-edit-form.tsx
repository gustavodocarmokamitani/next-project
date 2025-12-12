"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select"
import { Plus, Trash2, Globe, Building2, Sparkles, X, Pencil } from "lucide-react"

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
  id: string // ID do ChampionshipCategory ou UUID temporário para novas
  nome: string
  allowUpgrade: boolean
  isNew?: boolean // Indica se é nova
  isDeleted?: boolean // Indica se foi marcada para deletar
  isEdited?: boolean // Indica se foi editada
}

type CategoriasEditFormProps = {
  categoriasGlobais: CategoriaGlobal[]
  categoriasOrganizacao: CategoriaOrganizacao[]
  categoriasGlobaisSelecionadas: string[]
  categoriasOrganizacaoSelecionadas: string[]
  categoriasCustom: Array<{ id: string; nome: string; allowUpgrade: boolean }>
  onCategoriasChange: (categorias: {
    globais: string[]
    organizacao: string[]
    custom: CategoriaCustom[]
  }) => void
}

export function CategoriasEditForm({
  categoriasGlobais,
  categoriasOrganizacao,
  categoriasGlobaisSelecionadas: globaisIniciais,
  categoriasOrganizacaoSelecionadas: organizacaoIniciais,
  categoriasCustom: customIniciais,
  onCategoriasChange,
}: CategoriasEditFormProps) {
  const [categoriasGlobaisSelecionadas, setCategoriasGlobaisSelecionadas] = useState<string[]>(globaisIniciais)
  const [categoriasOrganizacaoSelecionadas, setCategoriasOrganizacaoSelecionadas] = useState<string[]>(organizacaoIniciais)
  const [categoriasCustom, setCategoriasCustom] = useState<CategoriaCustom[]>(
    customIniciais.map((c) => ({
      ...c,
      isNew: false,
      isDeleted: false,
      isEdited: false,
    }))
  )
  const [showFormCustom, setShowFormCustom] = useState(false)
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null)
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
      isNew: true,
    }

    const novasCustom = [...categoriasCustom, novaCustom]
    setCategoriasCustom(novasCustom)
    updateCallback(
      categoriasGlobaisSelecionadas,
      categoriasOrganizacaoSelecionadas,
      novasCustom.filter((c) => !c.isDeleted)
    )
    setFormCustom({ nome: "", allowUpgrade: false })
    setShowFormCustom(false)
  }

  const handleEditCustom = (id: string) => {
    const customToEdit = categoriasCustom.find((c) => c.id === id)
    if (customToEdit) {
      setFormCustom({
        nome: customToEdit.nome,
        allowUpgrade: customToEdit.allowUpgrade,
      })
      setEditingCustomId(id)
      setShowFormCustom(true)
    }
  }

  const handleUpdateCustom = () => {
    if (!editingCustomId || !formCustom.nome.trim()) {
      return
    }

    const novasCustom = categoriasCustom.map((c) =>
      c.id === editingCustomId
        ? {
            ...c,
            nome: formCustom.nome.trim(),
            allowUpgrade: formCustom.allowUpgrade,
            isEdited: c.isNew ? false : true,
          }
        : c
    )
    setCategoriasCustom(novasCustom)
    updateCallback(
      categoriasGlobaisSelecionadas,
      categoriasOrganizacaoSelecionadas,
      novasCustom.filter((c) => !c.isDeleted)
    )
    setFormCustom({ nome: "", allowUpgrade: false })
    setEditingCustomId(null)
    setShowFormCustom(false)
  }

  const handleRemoveCustom = (id: string) => {
    const customToRemove = categoriasCustom.find((c) => c.id === id)
    let novasCustom: CategoriaCustom[]
    if (customToRemove?.isNew) {
      // Se for nova, apenas remove do estado
      novasCustom = categoriasCustom.filter((c) => c.id !== id)
    } else {
      // Se for existente, marca para deletar
      novasCustom = categoriasCustom.map((c) => (c.id === id ? { ...c, isDeleted: true } : c))
    }
    setCategoriasCustom(novasCustom)
    updateCallback(
      categoriasGlobaisSelecionadas,
      categoriasOrganizacaoSelecionadas,
      novasCustom.filter((c) => !c.isDeleted)
    )
  }

  const handleGlobaisChange = (selected: string[]) => {
    setCategoriasGlobaisSelecionadas(selected)
    updateCallback(
      selected,
      categoriasOrganizacaoSelecionadas,
      categoriasCustom.filter((c) => !c.isDeleted)
    )
  }

  const handleOrganizacaoChange = (selected: string[]) => {
    setCategoriasOrganizacaoSelecionadas(selected)
    updateCallback(
      categoriasGlobaisSelecionadas,
      selected,
      categoriasCustom.filter((c) => !c.isDeleted)
    )
  }

  const categoriasCustomVisiveis = categoriasCustom.filter((c) => !c.isDeleted)
  const totalCategorias =
    categoriasGlobaisSelecionadas.length +
    categoriasOrganizacaoSelecionadas.length +
    categoriasCustomVisiveis.length

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
              {categoriasCustomVisiveis.length} criada(s)
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowFormCustom(!showFormCustom)
              setEditingCustomId(null)
              setFormCustom({ nome: "", allowUpgrade: false })
            }}
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
                onClick={editingCustomId ? handleUpdateCustom : handleAddCustom}
                className="flex-1"
                disabled={!formCustom.nome.trim()}
              >
                {editingCustomId ? "Salvar Alterações" : "Adicionar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFormCustom(false)
                  setEditingCustomId(null)
                  setFormCustom({ nome: "", allowUpgrade: false })
                }}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {categoriasCustomVisiveis.length > 0 && (
          <div className="space-y-2">
            {categoriasCustomVisiveis.map((custom) => (
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
                    {custom.isNew && (
                      <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs">
                        Nova
                      </span>
                    )}
                    {custom.isEdited && (
                      <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 text-xs">
                        Editada
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCustom(custom.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustom(custom.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
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

