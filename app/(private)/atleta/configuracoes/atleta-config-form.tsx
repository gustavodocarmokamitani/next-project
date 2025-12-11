"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAtletaPerfil, updateAtletaSenha } from "../actions"
import { AtletaDTO } from "@/app/(private)/home/atletas/queries"
import { useRouter } from "next/navigation"

type AtletaConfigFormProps = {
  atleta: AtletaDTO
}

export function AtletaConfigForm({ atleta }: AtletaConfigFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return (
    <>
    <form action={updateAtletaPerfil} className="space-y-6">
      <input type="hidden" name="id" value={atleta.id} />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={atleta.firstName}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome *</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={atleta.lastName}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={atleta.phone}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Data de Nascimento *</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={formatDateForInput(atleta.birthDate)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="federationId">ID da Federação</Label>
          <Input
            id="federationId"
            name="federationId"
            defaultValue={atleta.federationId || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confederationId">ID da Confederação</Label>
          <Input
            id="confederationId"
            name="confederationId"
            defaultValue={atleta.confederationId || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shirtNumber">Número da Camisa</Label>
          <Input
            id="shirtNumber"
            name="shirtNumber"
            defaultValue={atleta.shirtNumber || ""}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/atleta")}
        >
          Cancelar
        </Button>
      </div>
    </form>

    {/* Alterar Senha */}
    <div className="mt-8 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Alterar Senha</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Atualize sua senha de acesso
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          {showPasswordForm ? "Cancelar" : "Alterar Senha"}
        </Button>
      </div>

      {showPasswordForm && (
        <form
          action={async (formData) => {
            setIsChangingPassword(true)
            await updateAtletaSenha(formData)
            setIsChangingPassword(false)
            setShowPasswordForm(false)
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual *</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              disabled={isChangingPassword}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha *</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={6}
              disabled={isChangingPassword}
            />
            <p className="text-xs text-muted-foreground">
              A senha deve ter no mínimo 6 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              disabled={isChangingPassword}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Salvando..." : "Salvar Nova Senha"}
            </Button>
          </div>
        </form>
      )}
    </div>
    </>
  )
}

