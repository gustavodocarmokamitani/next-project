import { LogOut, Settings, UserCog, Users } from "lucide-react"
import { getSession } from "@/lib/get-session"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export async function UserInfo() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const isManager = session.role === "GERENTE"
  const Icon = isManager ? UserCog : Users
  const roleLabel = isManager ? "Gerente" : "Atleta"

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg",
          isManager
            ? "bg-primary/10 text-primary"
            : "bg-blue-500/10 text-blue-500",
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-foreground text-center md:text-left">
          {session.name || "Usuário"}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{session.teamName || "Sem equipe"}</span>
          <span>•</span>
          <span className="font-medium">{roleLabel}</span>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

