"use client"

import { useState } from "react"
import { updateCategoriaGlobal, deleteCategoriaGlobal } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

type CategoriaGlobalEditFormProps = {
  categoria: {
    id: string
    nome: string
  }
}

export function CategoriaGlobalEditForm({ categoria }: CategoriaGlobalEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <div className="space-y-6">
      <form
        action={async (formData) => {
          formData.append("id", categoria.id)
          setIsSubmitting(true)
          await updateCategoriaGlobal(formData)
          setIsSubmitting(false)
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Categoria Global *</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={categoria.nome}
            placeholder="Ex: Sub-15, Sub-17, Sub-20, Adulto..."
            required
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            O nome deve ser único entre as categorias globais.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
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

      {/* Delete Section */}
      <div className="pt-6 border-t border-border">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
          <p className="text-sm text-muted-foreground">
            Ao deletar esta categoria global, ela não estará mais disponível para seleção em novos campeonatos.
            Categorias já utilizadas em campeonatos existentes não serão afetadas.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Categoria Global
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja deletar a categoria global "{categoria.nome}"?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setIsDeleting(true)
                    await deleteCategoriaGlobal(categoria.id)
                    setIsDeleting(false)
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

