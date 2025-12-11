"use client"

import { useState, useMemo } from "react"
import { SearchInput } from "@/app/components/search-input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { GerenteCard } from "./gerente-card"
import type { GerenteDTO } from "./queries"
import type { CategoriaDTO } from "../categorias/queries"

type SearchWrapperProps = {
  gerentes: GerenteDTO[]
  categorias: CategoriaDTO[]
}

export function SearchWrapper({ gerentes, categorias }: SearchWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtra gerentes baseado no termo de busca
  const filteredGerentes = useMemo(() => {
    if (!searchTerm.trim()) {
      return gerentes
    }

    const term = searchTerm.toLowerCase().trim()

    return gerentes.filter((gerente) => {
      const nome = `${gerente.firstName} ${gerente.lastName}`.toLowerCase()
      const telefone = gerente.phone.toLowerCase()
      const categoriasStr = gerente.categorias.map((c) => c.name).join(" ").toLowerCase()

      return (
        nome.includes(term) ||
        telefone.includes(term) ||
        categoriasStr.includes(term) ||
        gerente.firstName.toLowerCase().includes(term) ||
        gerente.lastName.toLowerCase().includes(term)
      )
    })
  }, [gerentes, searchTerm])

  // Agrupa gerentes filtrados por categoria
  const gerentesPorCategoria = useMemo(() => {
    return categorias.map((cat) => ({
      categoria: cat,
      gerentes: filteredGerentes.filter((g) =>
        g.categorias.some((gc) => gc.id === cat.id),
      ),
    }))
  }, [filteredGerentes, categorias])

  return (
    <>
      <div className="mb-4">
        <SearchInput
          placeholder="Buscar por nome, telefone ou categoria..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {filteredGerentes.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum gerente encontrado com o termo de busca."
              : "Nenhum gerente cadastrado ainda."}
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {gerentesPorCategoria.map(
            ({ categoria, gerentes: gerentesCat }) =>
              gerentesCat.length > 0 && (
                <AccordionItem
                  key={categoria.id}
                  value={categoria.id}
                  className="border border-border rounded-lg px-4 mb-4"
                >
                  <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                    {categoria.nome} ({gerentesCat.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {gerentesCat.map((gerente) => (
                        <GerenteCard key={gerente.id} gerente={gerente} />
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

