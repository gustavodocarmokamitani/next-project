"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, DollarSign, Lock, Pencil, X } from "lucide-react"

export type DespesaItem = {
  id: string // UUID temporário para novas, ou ID do banco para existentes
  nome: string
  valor: string
  quantityEnabled: boolean
  isFixed: boolean
  isNew?: boolean // Indica se é uma nova despesa
  isDeleted?: boolean // Indica se foi marcada para deletar
  isEdited?: boolean // Indica se foi editada
}

type DespesasEditFormProps = {
  despesasIniciais: Array<{
    id: string
    nome: string
    valor: number
    quantityEnabled: boolean
    isFixed: boolean
    required: boolean
  }>
  onDespesasChange: (despesas: DespesaItem[]) => void
}

export function DespesasEditForm({
  despesasIniciais,
  onDespesasChange,
}: DespesasEditFormProps) {
  const [despesas, setDespesas] = useState<DespesaItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    quantityEnabled: false,
    isFixed: false,
  })

  // Inicializa com as despesas existentes
  useEffect(() => {
    const despesasIniciaisFormatadas: DespesaItem[] = despesasIniciais.map((d) => ({
      id: d.id,
      nome: d.nome,
      valor: d.valor.toString(),
      quantityEnabled: d.quantityEnabled,
      isFixed: d.isFixed,
      isNew: false,
      isDeleted: false,
      isEdited: false,
    }))
    setDespesas(despesasIniciaisFormatadas)
  }, [despesasIniciais])

  // Atualiza o callback sempre que despesas mudarem
  useEffect(() => {
    onDespesasChange(despesas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [despesas])

  const handleAddDespesa = () => {
    if (!formData.nome.trim() || !formData.valor.trim()) {
      return
    }

    const valorNum = parseFloat(formData.valor.replace(",", "."))
    if (isNaN(valorNum) || valorNum <= 0) {
      return
    }

    const novaDespesa: DespesaItem = {
      id: crypto.randomUUID(),
      nome: formData.nome.trim(),
      valor: formData.valor.replace(",", "."),
      quantityEnabled: formData.quantityEnabled,
      isFixed: formData.isFixed,
      isNew: true,
      isDeleted: false,
      isEdited: false,
    }

    const novasDespesas = [...despesas, novaDespesa]
    setDespesas(novasDespesas)

    // Reset form
    setFormData({
      nome: "",
      valor: "",
      quantityEnabled: false,
      isFixed: false,
    })
  }

  const handleEditDespesa = (id: string) => {
    const despesa = despesas.find((d) => d.id === id && !d.isDeleted)
    if (despesa) {
      setFormData({
        nome: despesa.nome,
        valor: despesa.valor,
        quantityEnabled: despesa.quantityEnabled,
        isFixed: despesa.isFixed,
      })
      setEditingId(id)
      setShowForm(true)
    }
  }

  const handleUpdateDespesa = () => {
    if (!editingId || !formData.nome.trim() || !formData.valor.trim()) {
      return
    }

    const valorNum = parseFloat(formData.valor.replace(",", "."))
    if (isNaN(valorNum) || valorNum <= 0) {
      return
    }

    const novasDespesas = despesas.map((d) => {
      if (d.id === editingId) {
        return {
          ...d,
          nome: formData.nome.trim(),
          valor: formData.valor.replace(",", "."),
          quantityEnabled: formData.quantityEnabled,
          isFixed: formData.isFixed,
          isEdited: !d.isNew, // Se não é nova, marca como editada
        }
      }
      return d
    })

    setDespesas(novasDespesas)
    setEditingId(null)
    setShowForm(false)
    setFormData({
      nome: "",
      valor: "",
      quantityEnabled: false,
      isFixed: false,
    })
  }

  const handleRemoveDespesa = (id: string) => {
    const despesa = despesas.find((d) => d.id === id)
    if (despesa?.isNew) {
      // Se é nova, remove completamente
      setDespesas(despesas.filter((d) => d.id !== id))
    } else {
      // Se existe no banco, marca como deletada
      setDespesas(
        despesas.map((d) => (d.id === id ? { ...d, isDeleted: true } : d)),
      )
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      nome: "",
      valor: "",
      quantityEnabled: false,
      isFixed: false,
    })
  }

  const formatValor = (valor: string) => {
    const num = parseFloat(valor)
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num)
  }

  const despesasVisiveis = despesas.filter((d) => !d.isDeleted)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Despesas do Campeonato
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as despesas que os atletas e organizações devem pagar
          </p>
        </div>
        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Despesa
          </Button>
        )}
      </div>

      {/* Formulário de Nova/Editar Despesa */}
      {showForm && (
        <Card className="p-4 space-y-4 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">
              {editingId ? "Editar Despesa" : "Nova Despesa"}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="despesa-nome">Nome da Despesa *</Label>
            <Input
              id="despesa-nome"
              placeholder="Ex: Café, Almoço, Alojamento, Inscrição, Árbitros..."
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="despesa-valor">Valor (R$) *</Label>
            <Input
              id="despesa-valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.valor}
              onChange={(e) =>
                setFormData({ ...formData, valor: e.target.value })
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="despesa-quantity"
                checked={formData.quantityEnabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    quantityEnabled: checked === true,
                  })
                }
              />
              <Label
                htmlFor="despesa-quantity"
                className="text-sm font-normal cursor-pointer"
              >
                Permitir quantidade (ex: múltiplas refeições para família)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="despesa-fixed"
                checked={formData.isFixed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFixed: checked === true })
                }
              />
              <Label
                htmlFor="despesa-fixed"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Despesa fixa (não exibida para atletas, apenas para organizações)
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={editingId ? handleUpdateDespesa : handleAddDespesa}
              className="flex-1"
            >
              {editingId ? "Salvar Alterações" : "Adicionar Despesa"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de Despesas */}
      {despesasVisiveis.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Despesas ({despesasVisiveis.length})
          </p>
          <div className="space-y-2">
            {despesasVisiveis.map((despesa) => (
              <Card
                key={despesa.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{despesa.nome}</span>
                    {despesa.isFixed && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Fixa
                      </span>
                    )}
                    {despesa.quantityEnabled && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-xs">
                        Com quantidade
                      </span>
                    )}
                    {despesa.isNew && (
                      <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs">
                        Nova
                      </span>
                    )}
                    {despesa.isEdited && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs">
                        Editada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatValor(despesa.valor)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditDespesa(despesa.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDespesa(despesa.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {despesasVisiveis.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma despesa adicionada. Clique em "Adicionar Despesa" para começar.
        </p>
      )}
    </div>
  )
}

