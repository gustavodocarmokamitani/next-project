"use client"

import { useState } from "react"
import { createCampeonatoConvite } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

type CampeonatoConviteFormProps = {
  campeonatoId: string
}

export function CampeonatoConviteForm({
  campeonatoId,
}: CampeonatoConviteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true)
        await createCampeonatoConvite(campeonatoId, formData)
        setIsSubmitting(false)
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Este convite será público e poderá ser aceito por qualquer organização que tenha o link. 
            Organizações que não possuem conta poderão se cadastrar e depois aceitar o convite.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diasExpiracao">Dias para expiração</Label>
          <Input
            id="diasExpiracao"
            name="diasExpiracao"
            type="number"
            min="1"
            max="365"
            defaultValue="30"
            placeholder="30"
          />
          <p className="text-xs text-muted-foreground">
            O convite expirará após este número de dias (padrão: 30 dias)
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Convite Público"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/home/campeonatos/${campeonatoId}/convites`)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

