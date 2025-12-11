"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { EventoAnalyticsDTO } from "./queries"
import { useCallback } from "react"

type DownloadReportButtonProps = {
  eventos: EventoAnalyticsDTO[]
}

export function DownloadReportButton({ eventos }: DownloadReportButtonProps) {
  const handleDownload = useCallback(() => {
    // Formata os dados para o relatório
    const relatorio = {
      geradoEm: new Date().toLocaleString("pt-BR"),
      resumo: {
        totalEventos: eventos.length,
        totalAtletasConfirmados: eventos.reduce(
          (sum, e) => sum + e.atletasConfirmados,
          0,
        ),
        totalAtletasPagos: eventos.reduce((sum, e) => sum + e.atletasPagos, 0),
        valorTotalRecebido: eventos.reduce((sum, e) => sum + e.valorRecebido, 0),
      },
      eventos: eventos.map((evento) => ({
        nome: evento.nome,
        local: evento.local,
        data: new Date(evento.data).toLocaleDateString("pt-BR"),
        categorias: evento.categorias.map((c) => c.name).join(", "),
        atletasConfirmados: evento.atletasConfirmados,
        atletasPagos: evento.atletasPagos,
        valorRecebido: evento.valorRecebido,
        itensPagos: evento.itensPagos,
        atletas: evento.atletas.map((a) => ({
          nome: a.nome,
          confirmado: a.confirmado ? "Sim" : "Não",
          pago: a.pago ? "Sim" : "Não",
          itensPagos: a.itensPagos.map((i) => `${i.nome} (${i.quantidade}x)`).join(", "),
        })),
      })),
    }

    // Converte para JSON formatado
    const jsonContent = JSON.stringify(relatorio, null, 2)

    // Cria um blob e faz o download
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-analytics-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [eventos])

  return (
    <Button onClick={handleDownload} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      <span>Baixar Relatório</span>
    </Button>
  )
}

