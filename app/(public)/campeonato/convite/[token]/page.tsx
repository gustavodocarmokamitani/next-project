"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, MapPin, AlertCircle, CheckCircle } from "lucide-react"

export default function CampeonatoConvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [convite, setConvite] = useState<{
    championshipId: string
    championshipName: string
    championshipDescription: string | null
    championshipStartDate: string
    championshipEndDate: string | null
    championshipLocation: string | null
    organizationName: string | null
    expiresAt: string
  } | null>(null)

  useEffect(() => {
    const fetchConvite = async () => {
      try {
        const res = await fetch(`/api/campeonato/invite/${token}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Erro ao carregar convite")
          return
        }

        setConvite(data.convite)
      } catch (err) {
        setError("Erro ao carregar convite")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConvite()
  }, [token])

  const handleAccept = async () => {
    setIsAccepting(true)
    setError(null)

    try {
      const res = await fetch("/api/campeonato/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Se o erro é de autenticação, mostra opções de cadastro/login
        if (res.status === 401) {
          setError(data.error || "Você precisa estar logado para aceitar o convite")
        } else {
          setError(data.error || "Erro ao aceitar convite")
        }
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/home")
      }, 2000)
    } catch (err) {
      setError("Erro ao aceitar convite")
    } finally {
      setIsAccepting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando convite...</p>
        </div>
      </div>
    )
  }

  if (error && !convite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Convite Inválido
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/login")}>
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Convite Aceito!
          </h1>
          <p className="text-muted-foreground mb-4">
            Você aceitou o convite para participar do campeonato.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecionando...
          </p>
        </div>
      </div>
    )
  }

  if (!convite) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full rounded-lg border border-border bg-card p-8 space-y-6">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Convite para Campeonato
          </h1>
          {convite.organizationName && (
            <p className="text-muted-foreground">
              Você foi convidado por <strong>{convite.organizationName}</strong>
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {convite.championshipName}
            </h2>
            {convite.championshipDescription && (
              <p className="text-muted-foreground">
                {convite.championshipDescription}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(convite.championshipStartDate)}
                {convite.championshipEndDate &&
                  ` - ${formatDate(convite.championshipEndDate)}`}
              </span>
            </div>
            {convite.championshipLocation && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{convite.championshipLocation}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          {error && error.includes("logado") ? (
            <>
              <Button
                onClick={() => router.push(`/organizacao/cadastro?token=${token}`)}
                className="w-full"
              >
                Cadastrar Organização
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Fazer Login
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex-1"
              >
                {isAccepting ? "Aceitando..." : "Aceitar Convite"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                disabled={isAccepting}
              >
                Fazer Login
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Este convite expira em: {formatDate(convite.expiresAt)}
        </p>
      </div>
    </div>
  )
}

