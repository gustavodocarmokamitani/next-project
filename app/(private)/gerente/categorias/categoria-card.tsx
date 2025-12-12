"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Globe } from "lucide-react"
import type { CategoriaDTO } from "./queries"

type CategoriaCardProps = {
  categoria: CategoriaDTO
}

export function CategoriaCard({ categoria }: CategoriaCardProps) {
  const isGlobal = categoria.isGlobal === true

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isGlobal && <Globe className="h-5 w-5 text-primary" />}
            <h3 className="font-semibold text-lg">{categoria.nome}</h3>
          </div>
          {isGlobal && (
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              Global
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

