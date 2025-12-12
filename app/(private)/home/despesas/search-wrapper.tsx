"use client"

import { useState, useMemo } from "react"
import { SearchInput } from "@/app/components/search-input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react"
import { DeleteDespesaDialog } from "./delete-despesa-dialog"
import type { DespesaDTO } from "./queries"
import type { CategoriaDTO } from "../categorias/queries"

type DespesaCardProps = {
  despesa: DespesaDTO
  totalValue: number
  formatDate: (date: Date) => string
}

type SearchWrapperProps = {
  despesas: DespesaDTO[]
  categorias: CategoriaDTO[]
}

export function SearchWrapper({ despesas, categorias }: SearchWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  // Filtra despesas baseado no termo de busca
  const filteredDespesas = useMemo(() => {
    if (!searchTerm.trim()) {
      return despesas
    }

    const term = searchTerm.toLowerCase().trim()

    return despesas.filter((despesa) => {
      const nome = despesa.name.toLowerCase()
      const evento = despesa.event?.name.toLowerCase() || ""
      const categoriasStr = despesa.categories.map((c) => c.name).join(" ").toLowerCase()
      const vencimento = formatDate(despesa.dueDate).toLowerCase()
      const itensStr = despesa.items.map((i) => i.name).join(" ").toLowerCase()
      const totalValue = despesa.items.reduce((sum, item) => sum + item.value, 0)
      const valorStr = totalValue.toString()

      return (
        nome.includes(term) ||
        evento.includes(term) ||
        categoriasStr.includes(term) ||
        vencimento.includes(term) ||
        itensStr.includes(term) ||
        valorStr.includes(term)
      )
    })
  }, [despesas, searchTerm])

  // Ordena pagamentos por data de vencimento
  const sortedDespesas = useMemo(() => {
    const sorted = [...filteredDespesas]
    sorted.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime()
      const dateB = new Date(b.dueDate).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })
    return sorted
  }, [filteredDespesas, sortOrder])

  // Agrupa pagamentos filtrados por categoria (um pagamento pode aparecer em múltiplas categorias)
  const despesasPorCategoria = useMemo(() => {
    return categorias.map((cat) => ({
      categoria: cat,
      despesas: sortedDespesas.filter((d) =>
        d.categories.some((dc) => dc.id === cat.id),
      ),
    }))
  }, [sortedDespesas, categorias])

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por nome, evento, categoria, data, itens, valor..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="sm:w-auto"
        >
          {sortOrder === "asc" ? (
            <>
              <ArrowDown className="h-4 w-4 mr-2" />
              Mais Recentes
            </>
          ) : (
            <>
              <ArrowUp className="h-4 w-4 mr-2" />
              Mais Antigos
            </>
          )}
        </Button>
      </div>

      {filteredDespesas.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum pagamento encontrado com o termo de busca."
              : "Nenhum pagamento cadastrado ainda."}
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {despesasPorCategoria.map(
            ({ categoria, despesas: despesasCat }) =>
              despesasCat.length > 0 && (
                <AccordionItem
                  key={categoria.id}
                  value={categoria.id}
                  className="border border-border rounded-lg px-4 mb-4"
                >
                  <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                    {categoria.nome} ({despesasCat.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                      {despesasCat.map((despesa) => {
                        const totalValue = despesa.items.reduce(
                          (sum, item) => sum + item.value,
                          0,
                        )
                        return (
                          <DespesaCard
                            key={despesa.id}
                            despesa={despesa}
                            totalValue={totalValue}
                            formatDate={formatDate}
                          />
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ),
          )}
        </Accordion>
      )}
    </>
  )
}

function DespesaCard({ despesa, totalValue, formatDate }: DespesaCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{despesa.name}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {despesa.categories.map((cat) => (
              <span
                key={cat.id}
                className="px-2 py-1 rounded-md bg-muted text-xs text-foreground"
              >
                {cat.name}
              </span>
            ))}
          </div>
          {despesa.event && (
            <p className="text-sm text-muted-foreground mt-2">
              Evento: {despesa.event.name}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Vencimento: {formatDate(despesa.dueDate)}
          </p>
          <p className="text-lg font-bold text-foreground mt-2">
            Total: R$ {totalValue.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Itens: {despesa.items.length}
          </p>
        </div>

        {despesa.items.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground">Itens</h4>
            {despesa.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-foreground"
              >
                <span>{item.name}</span>
                <span>R$ {item.value.toFixed(2)}</span>
              </div>
            ))}
            {despesa.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{despesa.items.length - 3} item(s)...
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/home/despesas/${despesa.id}/itens`}>
              <Plus className="h-4 w-4 mr-2" />
              {despesa.items.length === 0 ? "Adicionar Itens" : "Gerenciar Itens"}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/home/despesas/editar/${despesa.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Apagar
          </Button>
        </div>
      </div>

      <DeleteDespesaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        despesaId={despesa.id}
        despesaNome={despesa.name}
      />
    </>
  )
}
