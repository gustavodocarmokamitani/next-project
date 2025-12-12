"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Phone, Lock, User, AlertCircle } from "lucide-react"

export default function AtletaConvitePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = params.token as string
  const categoriasIds = searchParams.get("categorias")?.split(",") || []

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    federationId: "",
    confederationId: "",
    birthDate: "",
    shirtNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // Buscar categorias
    const fetchCategorias = async () => {
      try {
        const res = await fetch("/api/categorias")
        if (res.ok) {
          const data = await res.json()
          setCategorias(data)
        }
      } catch (err) {
        console.error("Erro ao buscar categorias:", err)
      }
    }
    fetchCategorias()

    // Verificar se o token é válido
    const checkToken = async () => {
      try {
        const res = await fetch(`/api/atleta/invite/${token}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Link de convite inválido ou expirado.")
        }
      } catch (err) {
        setError("Erro ao verificar o link de convite.")
      }
    }
    checkToken()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (categoriasIds.length === 0) {
      setError("Nenhuma categoria foi selecionada no convite")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/atleta/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          password: formData.password,
          token,
          categorias: categoriasIds,
          federationId: formData.federationId || null,
          confederationId: formData.confederationId || null,
          birthDate: formData.birthDate,
          shirtNumber: formData.shirtNumber || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta")
        return
      }

      // Redireciona para o home
      router.push("/login")
      router.refresh()
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (error && (error.includes("inválido") || error?.includes("expirado"))) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Link Inválido</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Cadastro de Atleta
          </h1>
          <p className="text-muted-foreground">
            Complete seu cadastro para participar da equipe
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md border border-destructive/30 bg-destructive/10 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="João"
                  value={formData.firstName}
                  onChange={handleChange}
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
                  type="text"
                  placeholder="Silva"
                  value={formData.lastName}
                  onChange={handleChange}
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
                type="tel"
                placeholder="(11) 98765-4321"
                value={formData.phone}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Este será seu usuário para login
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shirtNumber">Nº da Camisa</Label>
              <Input
                id="shirtNumber"
                type="text"
                placeholder="10"
                value={formData.shirtNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="federationId">Nº da Federação</Label>
              <Input
                id="federationId"
                type="text"
                placeholder="12345"
                value={formData.federationId}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confederationId">Nº da Confederação</Label>
              <Input
                id="confederationId"
                type="text"
                placeholder="67890"
                value={formData.confederationId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categorias que você participará</Label>
            <div className="space-y-2 mt-2 p-4 rounded-lg border border-border bg-muted/30">
              {categorias.length === 0 ? (
                <p className="text-sm text-muted-foreground">Carregando categorias...</p>
              ) : categoriasIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria foi selecionada no convite
                </p>
              ) : (
                categorias
                  .filter((cat) => categoriasIds.includes(cat.id))
                  .map((categoria) => (
                    <div
                      key={categoria.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20"
                    >
                      <div className="w-4 h-4 rounded border border-primary bg-primary/10 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-primary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {categoria.name}
                      </span>
                    </div>
                  ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Estas categorias foram definidas no convite e não podem ser alteradas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo de 6 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </div>
    </main>
  )
}

