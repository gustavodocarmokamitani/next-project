"use client"

import { useState } from "react"
import { deleteEvento } from "./actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type DeleteEventoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventoId: string
  eventoNome: string
}

export function DeleteEventoDialog({
  open,
  onOpenChange,
  eventoId,
  eventoNome,
}: DeleteEventoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEvento(eventoId)
    } catch (error) {
      setIsDeleting(false)
      console.error("Erro ao deletar evento:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isDeleting && onOpenChange(newOpen)}>
      <DialogContent
        onPointerDownOutside={(e) => isDeleting && e.preventDefault()}
        onEscapeKeyDown={(e) => isDeleting && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar o evento{" "}
            <strong className="text-foreground">{eventoNome}</strong>? Esta
            ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deletando...
              </>
            ) : (
              "Deletar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

