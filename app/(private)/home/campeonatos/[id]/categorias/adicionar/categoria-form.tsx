"use client"

import { useState } from "react"
import { createCampeonatoCategoria } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

type CategoriaGlobal = {
  id: string
  nome: string
}

type CampeonatoCategoriaFormProps = {
  campeonatoId: string
  categoriasGlobais: CategoriaGlobal[]
}

export function CampeonatoCategoriaForm({
  campeonatoId,
  categoriasGlobais,
}: CampeonatoCategoriaFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoCategoria, setTipoCategoria] = useState<"global" | "custom">("global")
  const [categoriaGlobalId, setCategoriaGlobalId] = useState<string>("")

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true)
        if (tipoCategoria === "global" && categoriaGlobalId) {
          formData.set("categoriaGlobalId", categoriaGlobalId)
          // Remove o campo nome se for categoria global (será pego da categoria global)
          formData.delete("nome")
        } else {
          formData.set("categoriaGlobalId", "")
        }
        await createCampeonatoCategoria(campeonatoId, formData)
        setIsSubmitting(false)
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Tipo de Categoria */}
        <div className="space-y-3">
          <Label>Tipo de Categoria</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoCategoria"
                value="global"
                checked={tipoCategoria === "global"}
                onChange={(e) => {
                  setTipoCategoria("global")
                  setCategoriaGlobalId("")
                }}
                className="w-4 h-4"
              />
              <span>Usar Categoria Global</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoCategoria"
                value="custom"
                checked={tipoCategoria === "custom"}
                onChange={(e) => {
                  setTipoCategoria("custom")
                  setCategoriaGlobalId("")
                }}
                className="w-4 h-4"
              />
              <span>Criar Categoria Custom</span>
            </label>
          </div>
        </div>

        {/* Seleção de Categoria Global */}
        {tipoCategoria === "global" && (
          <div className="space-y-2">
            <Label htmlFor="categoriaGlobalId">
              Selecionar Categoria Global *
            </Label>
            <div className="relative">
              <select
                id="categoriaGlobalId"
                required={tipoCategoria === "global"}
                value={categoriaGlobalId}
                onChange={(e) => setCategoriaGlobalId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
              >
                <option value="">Selecione uma categoria</option>
                {categoriasGlobais.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {categoriaGlobalId && (
              <input
                type="hidden"
                name="nome"
                value={
                  categoriasGlobais.find((c) => c.id === categoriaGlobalId)
                    ?.nome || ""
                }
              />
            )}
            {!categoriaGlobalId && tipoCategoria === "global" && (
              <p className="text-sm text-destructive">
                Selecione uma categoria global
              </p>
            )}
          </div>
        )}

        {/* Nome da Categoria Custom */}
        {tipoCategoria === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Categoria *</Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Veteranos, Elite, Amadores"
              required={tipoCategoria === "custom"}
            />
          </div>
        )}

        {/* Allow Upgrade */}
        <div className="flex items-center space-x-2">
          <Checkbox id="allowUpgrade" name="allowUpgrade" />
          <Label
            htmlFor="allowUpgrade"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Permitir upgrade de categoria
            <span className="block text-xs text-muted-foreground mt-1">
              Atletas de categorias menores podem participar desta categoria
            </span>
          </Label>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Adicionar Categoria"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/home/campeonatos/${campeonatoId}/categorias`)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

