"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ResetPasswordButton() {
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="space-y-2">
      <input type="hidden" name="resetPassword" value={isActive ? "1" : "0"} />
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsActive(!isActive)}
        className={isActive ? "border-green-500 text-green-500 hover:bg-green-500/10" : "border-primary text-primary hover:bg-primary/10"}
      >
        {isActive ? "Cancelar Redefinição" : "Redefinir Senha"}
      </Button>
      <p className="text-xs text-muted-foreground">
        A senha será redefinida para a padrão (12345678).
      </p>
    </div>
  )
}

