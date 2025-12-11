"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export function SettingsButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSettings = () => {
    // Redireciona baseado no tipo de usuário
    if (pathname?.startsWith("/atleta")) {
      router.push("/atleta/configuracoes");
    } else if (pathname?.startsWith("/gerente")) {
      router.push("/gerente/configuracoes");
    } else if (pathname?.startsWith("/home")) {
      router.push("/home/configuracoes");
    } else {
      router.push("/settings");
    }
  };

  return (
    <Button variant="outline" onClick={handleSettings} className="gap-2">
      <Settings className="h-4 w-4" />
      <span>Configurações</span>
    </Button>
  );
}
