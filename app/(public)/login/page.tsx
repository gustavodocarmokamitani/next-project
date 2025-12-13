"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/auth-api"
import { LogIn, Mail, Lock, Phone } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extrai o token do convite do parâmetro redirect se existir
  const getInviteTokenFromRedirect = () => {
    const redirect = searchParams.get("redirect")
    if (redirect?.includes("/campeonato/convite/")) {
      const match = redirect.match(/\/campeonato\/convite\/([^?]+)/)
      return match ? match[1] : null
    }
    return null
  }

  const inviteToken = getInviteTokenFromRedirect()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      // Detecta se é email ou telefone
      const isEmail = emailOrPhone.includes("@")
      const loginPayload = isEmail
        ? { email: emailOrPhone, password }
        : { phone: emailOrPhone, password }
      
      const response = await authApi.login(loginPayload)
      
      // Prioriza o parâmetro redirect da URL, depois usa o redirectPath da API, senão usa /home
      const redirectPath = searchParams.get("redirect") || (response as any).redirectPath || "/home"
      
      // Usa window.location para garantir que o cookie seja enviado corretamente
      window.location.href = redirectPath
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao autenticar"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground">
            Entre na sua conta para continuar
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md border border-destructive/30 bg-destructive/10 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone">Email ou Telefone</Label>
            <div className="relative">
              {emailOrPhone.includes("@") ? (
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="seu@email.com ou 11986927887"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Digite seu email ou número de telefone (apenas números)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link 
              href={inviteToken 
                ? `/organizacao/cadastro?token=${inviteToken}`
                : "/register"
              } 
              className="text-primary hover:underline font-medium"
            >
              Criar conta
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Carregando...
            </h1>
          </div>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}

