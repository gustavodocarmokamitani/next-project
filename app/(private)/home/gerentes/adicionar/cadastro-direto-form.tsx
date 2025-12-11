"use client"

import { useState } from "react"
import { createGerente } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, Lock, User } from "lucide-react"
import Link from "next/link"

type CadastroDiretoFormProps = {
  categorias: { id: string; nome: string }[]
}

export function CadastroDiretoForm({ categorias }: CadastroDiretoFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={createGerente} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Dados do Gerente
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Preencha os dados do gerente. Ele poderá fazer login usando o telefone
          e a senha definida aqui.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="João"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Silva"
                required
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(11) 98765-4321"
              required
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            O telefone será usado para login
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={6}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Mínimo de 6 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label>Categorias Gerenciadas *</Label>
          <div className="space-y-2 mt-2 p-4 rounded-lg border border-border bg-muted/30 max-h-64 overflow-y-auto">
            {categorias.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria cadastrada.{" "}
                <Link
                  href="/home/categorias/adicionar"
                  className="text-primary hover:underline"
                >
                  Adicionar categoria
                </Link>
              </p>
            ) : (
              categorias.map((categoria) => (
                <label
                  key={categoria.id}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    name="categorias"
                    value={categoria.id}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">
                    {categoria.nome}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={categorias.length === 0}>
          Salvar
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/home/gerentes">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}

