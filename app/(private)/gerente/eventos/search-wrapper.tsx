"use client"

import { useState, useMemo } from "react"
import { SearchInput } from "@/app/components/search-input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { EventoCard } from "./evento-card"
import { ArrowUp, ArrowDown } from "lucide-react"
import type { EventoDTO } from "./queries"
import type { CategoriaDTO } from "../categorias/queries"

type SearchWrapperProps = {
  eventos: EventoDTO[]
  categorias: CategoriaDTO[]
}

export function SearchWrapper({ eventos, categorias }: SearchWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date))
  }

  // Filtra eventos baseado no termo de busca
  const filteredEventos = useMemo(() => {
    if (!searchTerm.trim()) {
      return eventos
    }

    const term = searchTerm.toLowerCase().trim()

    return eventos.filter((evento) => {
      const nome = evento.name.toLowerCase()
      const local = evento.location?.toLowerCase() || ""
      const tipo = evento.type.toLowerCase()
      const descricao = evento.description?.toLowerCase() || ""
      const data = formatDate(evento.date).toLowerCase()
      const categoriasStr = evento.categorias.map((c) => c.name).join(" ").toLowerCase()

      return (
        nome.includes(term) ||
        local.includes(term) ||
        tipo.includes(term) ||
        descricao.includes(term) ||
        data.includes(term) ||
        categoriasStr.includes(term)
      )
    })
  }, [eventos, searchTerm])

  // Ordena eventos por data
  const sortedEventos = useMemo(() => {
    const sorted = [...filteredEventos]
    sorted.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })
    return sorted
  }, [filteredEventos, sortOrder])

  // Agrupa eventos filtrados por categoria
  const eventosPorCategoria = useMemo(() => {
    return categorias.map((cat) => ({
      categoria: cat,
      eventos: sortedEventos.filter((e) =>
        e.categorias.some((ec) => ec.id === cat.id),
      ),
    }))
  }, [sortedEventos, categorias])

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por nome, local, tipo, data, categoria..."
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

      {filteredEventos.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum evento encontrado com o termo de busca."
              : "Nenhum evento cadastrado ainda."}
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {eventosPorCategoria.map(
            ({ categoria, eventos: eventosCat }) =>
              eventosCat.length > 0 && (
                <AccordionItem
                  key={categoria.id}
                  value={categoria.id}
                  className="border border-border rounded-lg px-4 mb-4"
                >
                  <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                    {categoria.nome} ({eventosCat.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                      {eventosCat.map((evento) => (
                        <EventoCard key={evento.id} evento={evento} />
                      ))}
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

