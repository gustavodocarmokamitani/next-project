import { LogOut, Settings, UserCog, Users } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export async function UserInfo() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  let Icon = Users;
  let roleLabel = "Atleta";
  
  if (session.role === "ADMIN") {
    Icon = UserCog;
    roleLabel = "Admin";
  } else if (session.role === "GERENTE") {
    Icon = UserCog;
    roleLabel = "Gerente";
  } else if (session.role === "ATLETA") {
    Icon = Users;
    roleLabel = "Atleta";
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg",
          session.role === "ADMIN"
            ? "bg-purple-500/10 text-purple-500"
            : session.role === "GERENTE"
              ? "bg-primary/10 text-primary"
              : "bg-blue-500/10 text-blue-500"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-foreground text-center md:text-left">
          {session.name || "Usuário"}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {session.teamName && (
            <>
              <span>{session.teamName}</span>
              <span>•</span>
            </>
          )}
          <span className="font-medium">{roleLabel}</span>
        </div>
      </div>
    </div>
  );
}
