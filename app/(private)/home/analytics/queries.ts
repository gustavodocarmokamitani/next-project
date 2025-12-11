import "server-only"
import { prisma } from "@/lib/prisma"

export type EventoAnalyticsDTO = {
  id: string
  nome: string
  local: string
  data: Date
  comentario: string | null
  categorias: { id: string; name: string }[]
  atletasConfirmados: number
  atletasPagos: number
  valorRecebido: number
  itensPagos: { nome: string; quantidade: number }[]
  atletas: {
    nome: string
    confirmado: boolean
    pago: boolean
    itensPagos: { nome: string; quantidade: number }[]
    itensConfirmados: { nome: string; quantidadeConfirmada: number; quantidadePaga: number }[]
    temDiscrepancia: boolean
  }[]
}

export async function getEventosAnalytics(): Promise<EventoAnalyticsDTO[]> {
  const eventos = await prisma.event.findMany({
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      payments: {
        include: {
          items: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })

  // Busca todos os atletas e suas categorias
  const atletas = await prisma.athlete.findMany({
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      attendances: {
        include: {
          paymentItems: {
            include: {
              paymentItem: true,
            },
          },
        },
      },
    },
  })

  // Busca todas as confirmações de presença de uma vez
  const allAttendances = await prisma.eventAttendance.findMany({
    where: {
      eventId: {
        in: eventos.map((e) => e.id),
      },
    },
    include: {
      athlete: true,
      paymentItems: {
        include: {
          paymentItem: true,
        },
      },
    },
  })

  return eventos.map((evento) => {
    // Filtra confirmações de presença para este evento
    const attendances = allAttendances.filter((att) => att.eventId === evento.id)

    // Filtra atletas que pertencem às categorias do evento
    const atletasDoEvento = atletas.filter((atleta) =>
      atleta.categories.some((ac) =>
        evento.categories.some((ec) => ec.categoryId === ac.categoryId),
      ),
    )

    // Calcula métricas de pagamento (usa paidQuantity)
    const valorRecebido = attendances.reduce((sum, att) => {
      return (
        sum +
        att.paymentItems
          .filter((pi) => pi.paid)
          .reduce((s, pi) => s + pi.paymentItem.value * pi.paidQuantity, 0)
      )
    }, 0)

    // Agrupa itens pagos por nome (usa paidQuantity)
    const itensPagosMap = new Map<string, number>()
    attendances.forEach((att) => {
      att.paymentItems
        .filter((pi) => pi.paid)
        .forEach((pi) => {
          const atual = itensPagosMap.get(pi.paymentItem.name) || 0
          itensPagosMap.set(pi.paymentItem.name, atual + pi.paidQuantity)
        })
    })

    const itensPagos = Array.from(itensPagosMap.entries()).map(([nome, quantidade]) => ({
      nome,
      quantidade,
    }))

    // Conta atletas confirmados e pagos
    const atletasConfirmados = attendances.filter((att) => att.confirmed).length
    const atletasPagos = attendances.filter((att) =>
      att.paymentItems.some((pi) => pi.paid),
    ).length

    // Prepara lista de atletas com status real
    const atletasList = atletasDoEvento.map((atleta) => {
      const attendance = attendances.find((att) => att.athleteId === atleta.id)
      const isConfirmed = attendance?.confirmed || false
      const isPaid = attendance?.paymentItems.some((pi) => pi.paid) || false
      
      // Itens pagos (usa paidQuantity)
      const itensPagosAtleta = (attendance?.paymentItems || [])
        .filter((pi) => pi.paid)
        .map((pi) => ({
          nome: pi.paymentItem.name,
          quantidade: pi.paidQuantity,
        }))

      // Itens confirmados vs pagos (para detectar discrepâncias)
      const itensConfirmadosAtleta = (attendance?.paymentItems || [])
        .filter((pi) => pi.confirmedQuantity > 0 || pi.paidQuantity > 0)
        .map((pi) => ({
          nome: pi.paymentItem.name,
          quantidadeConfirmada: pi.confirmedQuantity,
          quantidadePaga: pi.paidQuantity,
        }))

      // Verifica se há discrepâncias
      const temDiscrepancia = itensConfirmadosAtleta.some(
        (item) => item.quantidadePaga !== item.quantidadeConfirmada
      )

      return {
        nome: `${atleta.firstName} ${atleta.lastName}`,
        confirmado: isConfirmed,
        pago: isPaid,
        itensPagos: itensPagosAtleta,
        itensConfirmados: itensConfirmadosAtleta,
        temDiscrepancia,
      }
    })

    return {
      id: evento.id,
      nome: evento.name,
      local: evento.location || "Local não informado",
      data: evento.date,
      comentario: evento.description,
      categorias: evento.categories.map((ec) => ({
        id: ec.category.id,
        name: ec.category.name,
      })),
      atletasConfirmados,
      atletasPagos,
      valorRecebido,
      itensPagos,
      atletas: atletasList,
    }
  })
}

