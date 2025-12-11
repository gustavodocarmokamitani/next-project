"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink } from "lucide-react"

export function InviteLinkGenerator() {
  const searchParams = useSearchParams()
  const link = searchParams.get("link")
  const [copied, setCopied] = useState(false)

  if (!link) {
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erro ao copiar:", error)
    }
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ExternalLink className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Link de convite gerado com sucesso!
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Compartilhe este link com o atleta para que ele possa se cadastrar.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={link}
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm font-mono text-foreground"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

