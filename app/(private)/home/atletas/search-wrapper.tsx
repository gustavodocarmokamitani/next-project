"use client"

import { useState, useMemo } from "react"
import { SearchInput } from "@/app/components/search-input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AtletaCard } from "./atleta-card"
import type { AtletaDTO } from "./queries"
import type { CategoriaDTO } from "../categorias/queries"

type SearchWrapperProps = {
  atletas: AtletaDTO[]
  categorias: CategoriaDTO[]
}

export function SearchWrapper({ atletas, categorias }: SearchWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtra atletas baseado no termo de busca
  const filteredAtletas = useMemo(() => {
    if (!searchTerm.trim()) {
      return atletas
    }

    const term = searchTerm.toLowerCase().trim()

    return atletas.filter((atleta) => {
      const nome = `${atleta.firstName} ${atleta.lastName}`.toLowerCase()
      const telefone = atleta.phone.toLowerCase()
      const categoriasStr = atleta.categorias.map((c) => c.name).join(" ").toLowerCase()
      const camisa = atleta.shirtNumber?.toLowerCase() || ""
      const federacao = atleta.federationId?.toLowerCase() || ""
      const confederacao = atleta.confederationId?.toLowerCase() || ""

      return (
        nome.includes(term) ||
        telefone.includes(term) ||
        categoriasStr.includes(term) ||
        atleta.firstName.toLowerCase().includes(term) ||
        atleta.lastName.toLowerCase().includes(term) ||
        camisa.includes(term) ||
        federacao.includes(term) ||
        confederacao.includes(term)
      )
    })
  }, [atletas, searchTerm])

  // Agrupa atletas filtrados por categoria
  const atletasPorCategoria = useMemo(() => {
    return categorias.map((cat) => ({
      categoria: cat,
      atletas: filteredAtletas.filter((a) =>
        a.categorias.some((ac) => ac.id === cat.id),
      ),
    }))
  }, [filteredAtletas, categorias])

  return (
    <>
      <div className="mb-4">
        <SearchInput
          placeholder="Buscar por nome, telefone, número da camisa, categoria..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {filteredAtletas.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum atleta encontrado com o termo de busca."
              : "Nenhum atleta cadastrado ainda."}
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {atletasPorCategoria.map(
            ({ categoria, atletas: atletasCat }) =>
              atletasCat.length > 0 && (
                <AccordionItem
                  key={categoria.id}
                  value={categoria.id}
                  className="border border-border rounded-lg px-4 mb-4"
                >
                  <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                    {categoria.nome} ({atletasCat.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {atletasCat.map((atleta) => (
                        <AtletaCard key={atleta.id} atleta={atleta} />
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

