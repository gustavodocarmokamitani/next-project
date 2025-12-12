"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, DollarSign, Lock } from "lucide-react"

export type DespesaItem = {
  id: string
  nome: string
  valor: string
  quantityEnabled: boolean
  isFixed: boolean
}

type DespesasCampeonatoFormProps = {
  onDespesasChange: (despesas: DespesaItem[]) => void
}

export function DespesasCampeonatoForm({
  onDespesasChange,
}: DespesasCampeonatoFormProps) {
  const [despesas, setDespesas] = useState<DespesaItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    quantityEnabled: false,
    isFixed: false,
  })

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
    }

    const novasDespesas = [...despesas, novaDespesa]
    setDespesas(novasDespesas)
    onDespesasChange(novasDespesas)

    // Reset form (mantém o formulário aberto)
    setFormData({
      nome: "",
      valor: "",
      quantityEnabled: false,
      isFixed: false,
    })
  }

  const handleRemoveDespesa = (id: string) => {
    const novasDespesas = despesas.filter((d) => d.id !== id)
    setDespesas(novasDespesas)
    onDespesasChange(novasDespesas)
  }

  const formatValor = (valor: string) => {
    const num = parseFloat(valor)
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Despesas do Campeonato
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione as despesas que os atletas e organizações devem pagar
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Despesa
        </Button>
      </div>

      {/* Formulário de Nova Despesa */}
      {showForm && (
        <Card className="p-4 space-y-4 border-2 border-primary/20">
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
              onClick={handleAddDespesa}
              className="flex-1"
            >
              Adicionar Despesa
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setFormData({
                  nome: "",
                  valor: "",
                  quantityEnabled: false,
                  isFixed: false,
                })
              }}
            >
              Fechar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de Despesas Adicionadas */}
      {despesas.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Despesas adicionadas ({despesas.length})
          </p>
          <div className="space-y-2">
            {despesas.map((despesa) => (
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
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatValor(despesa.valor)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDespesa(despesa.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {despesas.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma despesa adicionada. Clique em "Adicionar Despesa" para começar.
        </p>
      )}
    </div>
  )
}

