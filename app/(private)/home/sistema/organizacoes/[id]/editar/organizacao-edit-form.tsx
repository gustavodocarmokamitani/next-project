"use client"

import { useState } from "react"
import { updateOrganizacao } from "../../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

type Organization = {
  id: string
  name: string
  stripeAccountId: string | null
}

type OrganizacaoEditFormProps = {
  organization: Organization
}

export function OrganizacaoEditForm({ organization }: OrganizacaoEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true)
        await updateOrganizacao(formData)
        setIsSubmitting(false)
      }}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={organization.id} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Organização *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={organization.name}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
          <Input
            id="stripeAccountId"
            name="stripeAccountId"
            defaultValue={organization.stripeAccountId || ""}
            placeholder="acct_..."
          />
          <p className="text-xs text-muted-foreground">
            ID da conta Stripe Connect associada a esta organização
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/home/sistema/organizacoes/${organization.id}`)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

