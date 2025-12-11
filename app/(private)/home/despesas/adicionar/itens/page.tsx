"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/app/components/back-button"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"

interface Item {
  id: string
  nome: string
  valor: number
  quantidadeMultipla: boolean
}

export default function AdicionarItensPage() {
  const [itens, setItens] = useState<Item[]>([])
  const [nomeItem, setNomeItem] = useState("")
  const [valorItem, setValorItem] = useState("")
  const [quantidadeMultipla, setQuantidadeMultipla] = useState(false)

  const handleAdicionarItem = () => {
    if (!nomeItem || !valorItem) return

    const novoItem: Item = {
      id: Date.now().toString(),
      nome: nomeItem,
      valor: parseFloat(valorItem),
      quantidadeMultipla,
    }

    setItens([...itens, novoItem])
    setNomeItem("")
    setValorItem("")
    setQuantidadeMultipla(false)
  }

  const total = itens.reduce((acc, item) => acc + item.valor, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/home/despesas" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Adicionar Itens</h1>
            <p className="text-muted-foreground mt-2">
              Adicione os itens do pagamento
            </p>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="rounded-lg border border-border bg-card p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Adicionar Novo Item
        </h2>
        <div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeItem">Nome do Item *</Label>
              <Input
                id="nomeItem"
                value={nomeItem}
                onChange={(e) => setNomeItem(e.target.value)}
                placeholder="Ex: Café, Almoço, Hospedagem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorItem">Valor do Item (R$) *</Label>
              <Input
                id="valorItem"
                type="number"
                step="0.01"
                value={valorItem}
                onChange={(e) => setValorItem(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quantidadeMultipla"
                checked={quantidadeMultipla}
                onChange={(e) => setQuantidadeMultipla(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="quantidadeMultipla" className="cursor-pointer">
                Permitir quantidade múltipla?
              </Label>
            </div>

            <Button onClick={handleAdicionarItem} className="w-full">
              Adicionar Item
            </Button>
          </div>
        </div>
      </div>

      {/* Added Items */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Itens Adicionados ({itens.length}) - Total: R$ {total.toFixed(2)}
          </h2>
          {itens.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum item adicionado a este pagamento ainda.
            </p>
          ) : (
            <div className="space-y-2 mt-4">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded border border-border bg-muted/50"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {item.nome}
                    </span>
                    {item.quantidadeMultipla && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Quantidade múltipla)
                      </span>
                    )}
                  </div>
                  <span className="text-foreground">
                    R$ {item.valor.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Finish Button */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          disabled={itens.length === 0}
        >
          Concluir
        </Button>
        <Button variant="outline" asChild>
          <Link href="/home/despesas">Cancelar</Link>
        </Button>
      </div>
    </div>
  )
}

