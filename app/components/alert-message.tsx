"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AlertMessage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  const success = searchParams.get("success")
  const error = searchParams.get("error")
  const message = success || error
  const isSuccess = !!success

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        // Remove os parâmetros da URL sem recarregar a página
        const params = new URLSearchParams(searchParams.toString())
        params.delete("success")
        params.delete("error")
        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
        router.replace(newUrl)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [message, router, searchParams])

  if (!message || !isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg animate-in slide-in-from-top-2 duration-300",
        isSuccess
          ? "border-chart-2/30 text-foreground"
          : "border-chart-5/30 text-foreground"
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-chart-2" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-chart-5" />
      )}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false)
          const params = new URLSearchParams(searchParams.toString())
          params.delete("success")
          params.delete("error")
          const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
          router.replace(newUrl)
        }}
        className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </button>
    </div>
  )
}

