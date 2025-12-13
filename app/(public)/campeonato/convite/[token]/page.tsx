"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import Confetti from "react-confetti"

export default function CampeonatoConvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
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
        setIsAccepting(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("Erro ao aceitar convite")
      setIsAccepting(false)
    }
  }

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
        // Dispara confetti quando o convite é carregado com sucesso
        setTimeout(() => {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 5000)
        }, 100)

        // Se voltou do login, tenta aceitar automaticamente após um pequeno delay
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get("autoAccept") === "true") {
          // Remove o parâmetro da URL
          window.history.replaceState({}, "", window.location.pathname)
          // Aguarda um pouco para garantir que a sessão foi estabelecida
          setTimeout(() => {
            handleAccept()
          }, 500)
        }
      } catch (err) {
        setError("Erro ao carregar convite")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConvite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
        {showConfetti && (
          <Confetti
            width={typeof window !== 'undefined' ? window.innerWidth : 0}
            height={typeof window !== 'undefined' ? window.innerHeight : 0}
            recycle={false}
            numberOfPieces={100}
            colors={["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]}
            initialVelocityY={-50}
            initialVelocityX={10}
            gravity={1.2}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
          />
        )}
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center relative z-10">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Convite Aceito!
          </h1>
          <p className="text-muted-foreground mb-6">
            Você aceitou o convite para participar do campeonato.
          </p>
          <Button
            onClick={() => router.push("/home")}
            className="w-full"
            size="lg"
          >
            Ir para o Home
          </Button>
        </div>
      </div>
    )
  }

  if (!convite) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={100}
          colors={["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]}
          initialVelocityY={-50}
          initialVelocityX={10}
          gravity={1.2}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
        />
      )}
      <div className="max-w-2xl w-full rounded-lg border border-border bg-card p-8 space-y-6 relative z-10">
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
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/campeonato/convite/${token}?autoAccept=true`)}`)}
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
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/campeonato/convite/${token}?autoAccept=true`)}`)}
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

