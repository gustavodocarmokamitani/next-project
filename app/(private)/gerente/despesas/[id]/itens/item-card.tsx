"use client"

import { useState } from "react"
import { deleteItemFromDespesaGerente } from "../../actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

type ItemCardProps = {
  item: {
    id: string
    name: string
    value: number
    quantityEnabled: boolean
  }
  paymentId: string
}

export function ItemCard({ item, paymentId }: ItemCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteItemFromDespesaGerente(item.id, paymentId)
    } catch (error) {
      setIsDeleting(false)
      console.error("Erro ao deletar item:", error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:shadow-md transition-shadow">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          {item.quantityEnabled && (
            <p className="text-sm text-muted-foreground mt-1">
              Permite quantidade
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">
              R$ {item.value.toFixed(2)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(newOpen) => !isDeleting && setDeleteDialogOpen(newOpen)}
      >
        <DialogContent
          onPointerDownOutside={(e) => isDeleting && e.preventDefault()}
          onEscapeKeyDown={(e) => isDeleting && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o item{" "}
              <strong className="text-foreground">{item.name}</strong>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
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
    </>
  )
}

