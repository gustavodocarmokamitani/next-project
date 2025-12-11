"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { removerCategoria } from "./actions"

type DeleteCategoriaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoriaId: string
  categoriaNome: string
}

export function DeleteCategoriaDialog({
  open,
  onOpenChange,
  categoriaId,
  categoriaNome,
}: DeleteCategoriaDialogProps) {
  const handleDelete = async () => {
    await removerCategoria(categoriaId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover Categoria</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deixar de fazer parte da categoria{" "}
            <strong>{categoriaNome}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

