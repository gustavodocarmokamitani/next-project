import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, MapPin, Mail, Clock } from "lucide-react"
import { acceptConvitePendente } from "./actions-pending-invites"
import type { ConvitePendenteDTO } from "./queries-pending-invites"

type ConvitesPendentesSectionProps = {
  convites: ConvitePendenteDTO[]
}

export function ConvitesPendentesSection({ convites }: ConvitesPendentesSectionProps) {
  if (convites.length === 0) {
    return null
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Convites Pendentes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {convites.map((convite) => (
          <Card key={convite.id} className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {convite.championshipName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Organizado por: {convite.organizerName}
                </p>
              </div>
            </div>

            {convite.championshipDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {convite.championshipDescription}
              </p>
            )}

            <div className="space-y-2 text-sm">
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expira em: {formatDate(convite.expiresAt)}</span>
              </div>
            </div>

            <form action={acceptConvitePendente}>
              <input type="hidden" name="token" value={convite.token} />
              <Button type="submit" className="w-full">
                Aceitar Convite
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  )
}

