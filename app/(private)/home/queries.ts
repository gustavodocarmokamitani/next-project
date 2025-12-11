import "server-only"
import { prisma } from "@/lib/prisma"

export type HomeStatsDTO = {
  totalAtletas: number
  eventosAtivos: number
  pagamentosPendentes: number
}

export async function getHomeStats(): Promise<HomeStatsDTO> {
  // Total de atletas
  const totalAtletas = await prisma.athlete.count()

  // Eventos ativos (eventos com data >= hoje)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const eventosAtivos = await prisma.event.count({
    where: {
      date: {
        gte: hoje,
      },
    },
  })

  // Pagamentos pendentes
  // Um pagamento está pendente se:
  // 1. Tem data de vencimento >= hoje E
  // 2. Existe pelo menos um AthletePaymentItem com paid = false
  const pagamentos = await prisma.payment.findMany({
    where: {
      dueDate: {
        gte: hoje,
      },
    },
    include: {
      items: {
        include: {
          athletePayments: true,
        },
      },
    },
  })

  const pagamentosPendentes = pagamentos.filter((payment) => {
    // Se não tem itens, não há pagamentos pendentes
    if (payment.items.length === 0) {
      return false
    }

    // Verifica se existe algum pagamento de atleta não pago
    const temPendente = payment.items.some((item) => {
      return item.athletePayments.some((ap) => !ap.paid)
    })

    return temPendente
  }).length

  return {
    totalAtletas,
    eventosAtivos,
    pagamentosPendentes,
  }
}

