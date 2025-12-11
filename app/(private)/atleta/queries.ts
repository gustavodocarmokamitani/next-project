import "server-only"
import { prisma } from "@/lib/prisma"

export type EventoAtletaDTO = {
  id: string
  name: string
  date: Date
  location: string | null
  type: string
  description: string | null
  categorias: { id: string; name: string }[]
  confirmed: boolean
  confirmedAt: Date | null
  paymentItems: {
    id: string
    name: string
    value: number
    quantityEnabled: boolean
    required: boolean
    confirmedQuantity?: number
  }[]
  paymentId: string | null
}

export type DespesaAtletaDTO = {
  id: string
  name: string
  dueDate: Date
  event: { id: string; name: string } | null
  paid: boolean
  paidAt: Date | null
  items: {
    id: string
    name: string
    value: number
    quantityEnabled: boolean
    required: boolean
    quantity: number
  }[]
}

export async function getEventosForAtleta(athleteId: string): Promise<EventoAtletaDTO[]> {
  // Busca as categorias do atleta
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: {
      categories: true,
      attendances: {
        include: {
          event: true,
          paymentItems: {
            include: {
              paymentItem: true,
            },
          },
        },
      },
    },
  })

  if (!athlete) {
    return []
  }

  const athleteCategoryIds = athlete.categories.map((ac) => ac.categoryId)

  // Busca eventos que têm pelo menos uma categoria em comum com o atleta
  const eventos = await prisma.event.findMany({
    where: {
      categories: {
        some: {
          categoryId: {
            in: athleteCategoryIds,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      payments: {
        include: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })

  // Mapeia as confirmações para facilitar acesso
  const attendancesMap = new Map(
    athlete.attendances.map((att) => [att.eventId, att])
  )

  // Mapeia os itens confirmados por evento
  const confirmedItemsMap = new Map<string, Map<string, number>>()
  athlete.attendances.forEach((att) => {
    const itemsMap = new Map<string, number>()
    if (att.paymentItems) {
      att.paymentItems.forEach((pi) => {
        itemsMap.set(pi.paymentItemId, pi.confirmedQuantity)
      })
    }
    confirmedItemsMap.set(att.eventId, itemsMap)
  })

  return eventos.map((evento) => {
    const attendance = attendancesMap.get(evento.id)
    const confirmedItems = confirmedItemsMap.get(evento.id) || new Map()
    
    // Pega a primeira despesa do evento (ou null se não houver)
    const payment = evento.payments[0] || null

    return {
      id: evento.id,
      name: evento.name,
      date: evento.date,
      location: evento.location,
      type: evento.type,
      description: evento.description,
      categorias: evento.categories.map((ec) => ({
        id: ec.category.id,
        name: ec.category.name,
      })),
      confirmed: attendance?.confirmed || false,
      confirmedAt: attendance?.confirmedAt || null,
      paymentItems: payment
        ? payment.items.map((item) => ({
            id: item.id,
            name: item.name,
            value: item.value,
            quantityEnabled: item.quantityEnabled,
            required: item.required,
            confirmedQuantity: confirmedItems.get(item.id) || 0,
          }))
        : [],
      paymentId: payment?.id || null,
    }
  })
}

export async function getDespesasForAtleta(athleteId: string): Promise<DespesaAtletaDTO[]> {
  // Busca as categorias do atleta
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: {
      categories: true,
      attendances: {
        include: {
          paymentItems: {
            include: {
              paymentItem: {
                include: {
                  payment: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!athlete) {
    return []
  }

  const athleteCategoryIds = athlete.categories.map((ac) => ac.categoryId)

  // Busca despesas que têm pelo menos uma categoria em comum com o atleta
  const payments = await prisma.payment.findMany({
    where: {
      categories: {
        some: {
          categoryId: {
            in: athleteCategoryIds,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      event: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  })

  // Mapeia os pagamentos do atleta agrupados por paymentId
  const paymentsMap = new Map<
    string,
    { paidItems: Set<string>; paidAt: Date | null; items: Map<string, number> }
  >()

  athlete.attendances.forEach((att) => {
    if (att.paymentItems) {
      att.paymentItems.forEach((pi) => {
        if (pi.paid) {
          const paymentId = pi.paymentItem.payment.id
          if (!paymentsMap.has(paymentId)) {
            paymentsMap.set(paymentId, {
              paidItems: new Set(),
              paidAt: pi.paidAt,
              items: new Map(),
            })
          }
          const paymentData = paymentsMap.get(paymentId)!
          paymentData.paidItems.add(pi.paymentItemId)
          paymentData.items.set(pi.paymentItemId, pi.paidQuantity)
          // Atualiza paidAt com o mais recente
          if (pi.paidAt && (!paymentData.paidAt || pi.paidAt > paymentData.paidAt)) {
            paymentData.paidAt = pi.paidAt
          }
        }
      })
    }
  })

  return payments.map((payment) => {
    const paymentData = paymentsMap.get(payment.id)
    const paidItemsSet = paymentData?.paidItems || new Set()

    // Verifica se todos os itens da despesa foram pagos
    // Considera que itens obrigatórios devem estar pagos
    const requiredItems = payment.items.filter((item) => item.required)
    const allRequiredPaid = requiredItems.every((item) => paidItemsSet.has(item.id))

    // Se há itens não obrigatórios selecionados, eles também devem estar pagos
    // Mas se nenhum item não obrigatório foi selecionado, ainda conta como pago se os obrigatórios estão pagos
    const isPaid = payment.items.length > 0 && allRequiredPaid
    const paidAt = paymentData?.paidAt || null

    return {
      id: payment.id,
      name: payment.name,
      dueDate: payment.dueDate,
      event: payment.event
        ? {
            id: payment.event.id,
            name: payment.event.name,
          }
        : null,
      paid: isPaid,
      paidAt,
      items: payment.items.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        quantityEnabled: item.quantityEnabled,
        required: item.required,
        quantity: paymentData?.items.get(item.id) || (item.required ? 1 : 0),
      })),
    }
  })
}

