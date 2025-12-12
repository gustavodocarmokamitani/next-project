"use client"

import { useState } from "react"
import { createCategoria } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import Link from "next/link"

export function CategoriaForm() {
  const [nome, setNome] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!nome.trim()) {
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("nome", nome.trim())
    formData.append("isCustom", "true")

    await createCategoria(formData)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Criar Categoria Custom
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Crie uma categoria custom exclusiva para sua organização. As categorias globais já estão disponíveis e podem ser utilizadas diretamente.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome" className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Nome da Categoria Custom *
          </Label>
          <Input
            id="nome"
            name="nome"
            type="text"
            placeholder="Ex: Adulto, Sub-18, Sub-21"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Esta categoria será exclusiva da sua organização e poderá ser editada e removida por você.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting || !nome.trim()}>
          {isSubmitting ? "Salvando..." : "Criar Categoria"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/home/categorias">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}

