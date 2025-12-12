"use client"

import { useState } from "react"
import { addItemToDespesa } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type ItensFormProps = {
  despesaId: string
}

export function ItensForm({ despesaId }: ItensFormProps) {
  const [quantityEnabled, setQuantityEnabled] = useState(false)
  const [required, setRequired] = useState(false)
  const [isFixed, setIsFixed] = useState(false)

  return (
    <form action={addItemToDespesa} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Adicionar Item
        </h2>
      </div>

      <input type="hidden" name="paymentId" value={despesaId} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Item *</Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Ex: Café, Almoço, Transporte..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="quantityEnabled"
              name="quantityEnabled"
              checked={quantityEnabled}
              onCheckedChange={(checked) => setQuantityEnabled(checked === true)}
            />
            <Label
              htmlFor="quantityEnabled"
              className="text-sm font-normal cursor-pointer"
            >
              Permitir que os atletas escolham a quantidade deste item
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              name="required"
              checked={required}
              onCheckedChange={(checked) => setRequired(checked === true)}
            />
            <Label
              htmlFor="required"
              className="text-sm font-normal cursor-pointer"
            >
              Item obrigatório (atletas devem pagar este item ao confirmar presença)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFixed"
              name="isFixed"
              checked={isFixed}
              onCheckedChange={(checked) => setIsFixed(checked === true)}
            />
            <Label
              htmlFor="isFixed"
              className="text-sm font-normal cursor-pointer"
            >
              Despesa fixa (não exibida para atletas, apenas para organizações)
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Adicionar Item
        </Button>
      </div>
    </form>
  )
}

