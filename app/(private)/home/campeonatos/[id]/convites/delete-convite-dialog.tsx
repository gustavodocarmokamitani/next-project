"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteCampeonatoConvite } from "./actions"

type DeleteCampeonatoConviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campeonatoId: string
  conviteId: string
  organizationName: string
}

export function DeleteCampeonatoConviteDialog({
  open,
  onOpenChange,
  campeonatoId,
  conviteId,
  organizationName,
}: DeleteCampeonatoConviteDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCampeonatoConvite(campeonatoId, conviteId)
      router.refresh()
    } catch (error) {
      console.error("Erro ao deletar convite:", error)
    } finally {
      setIsDeleting(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o convite para{" "}
            <strong>{organizationName}</strong>? Esta ação não pode ser desfeita.
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
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

