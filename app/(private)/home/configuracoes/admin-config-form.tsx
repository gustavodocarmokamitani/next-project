"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAdminPerfil, updateAdminSenha } from "../actions"
import { useRouter } from "next/navigation"

type AdminConfigFormProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    organizationName: string | null
  }
}

export function AdminConfigForm({ user }: AdminConfigFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  return (
    <>
    <form action={updateAdminPerfil} className="space-y-6">
      <input type="hidden" name="id" value={user.id} />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name || ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email || ""}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="organizationName">Nome da Organização</Label>
          <Input
            id="organizationName"
            name="organizationName"
            defaultValue={user.organizationName || ""}
            placeholder="Ex: Federação Paulista, Confederação Brasileira, Time ABC"
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
          onClick={() => router.push("/home")}
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
            await updateAdminSenha(formData)
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

