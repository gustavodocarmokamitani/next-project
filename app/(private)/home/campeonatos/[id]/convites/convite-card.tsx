"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Mail, CheckCircle, XCircle, Clock, Copy } from "lucide-react"
import { DeleteCampeonatoConviteDialog } from "./delete-convite-dialog"
import type { CampeonatoConviteDTO } from "./queries"

type CampeonatoConviteCardProps = {
  campeonatoId: string
  convite: CampeonatoConviteDTO
}

export function CampeonatoConviteCard({
  campeonatoId,
  convite,
}: CampeonatoConviteCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const isExpired = new Date(convite.expiresAt) < new Date()

  const inviteUrl = `${window.location.origin}/campeonato/convite/${convite.token}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar link:", err)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">
              {convite.organizationName || "Convite Público"}
            </h3>
            {!convite.organizationName && (
              <p className="text-xs text-muted-foreground mt-1">
                Qualquer organização pode aceitar este convite
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {convite.used ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Aceito
                </span>
              ) : isExpired ? (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <XCircle className="h-4 w-4" />
                  Expirado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-yellow-600">
                  <Clock className="h-4 w-4" />
                  Pendente
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expira em: {formatDate(convite.expiresAt)}
            </p>
            {convite.usedAt && (
              <p className="text-xs text-muted-foreground">
                Aceito em: {formatDate(convite.usedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Link do Convite */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Label className="text-sm font-medium">Link do Convite</Label>
          <div className="flex gap-2">
            <Input
              value={inviteUrl}
              readOnly
              className="flex-1 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-green-600">Link copiado!</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Apagar
          </Button>
        </div>
      </div>

      <DeleteCampeonatoConviteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        campeonatoId={campeonatoId}
        conviteId={convite.id}
        organizationName={convite.organizationName || "Organização"}
      />
    </>
  )
}

