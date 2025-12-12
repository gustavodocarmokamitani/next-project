"use client"

import { useState } from "react"
import { createCategoriaGlobal } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function CategoriaGlobalForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true)
        await createCategoriaGlobal(formData)
        setIsSubmitting(false)
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Categoria Global *</Label>
        <Input
          id="nome"
          name="nome"
          placeholder="Ex: Sub-15, Sub-17, Sub-20, Adulto..."
          required
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          O nome deve ser único entre as categorias globais. Esta categoria ficará disponível para todas as organizações.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Categoria Global"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/home/sistema/categorias")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

