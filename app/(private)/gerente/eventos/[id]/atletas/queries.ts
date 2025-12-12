import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type AtletaEventoDTO = {
  id: string
  firstName: string
  lastName: string
  phone: string
  shirtNumber: string | null
  confirmed: boolean
  confirmedAt: Date | null
  paymentItems: {
    id: string
    name: string
    value: number
    quantityEnabled: boolean
    required: boolean
    confirmedQuantity: number
    paidQuantity: number
    paid: boolean
    paidAt: Date | null
  }[]
  attendanceId: string | null
}

export type EventoDetalhesDTO = {
  id: string
  name: string
  date: Date
  location: string | null
  type: string
  description: string | null
  categorias: { id: string; name: string }[]
  paymentId: string | null
  paymentItems: {
    id: string
    name: string
    value: number
    quantityEnabled: boolean
    required: boolean
  }[]
}

export async function getEventoDetalhesGerente(
  eventoId: string,
): Promise<EventoDetalhesDTO | null> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return null
  }

  const evento = await prisma.event.findUnique({
    where: { id: eventoId },
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
  })

  if (!evento) {
    return null
  }

  // Filtra categorias do gerente
  const categoriasDoGerente = evento.categories.filter((ec) =>
    session.categoryIds?.includes(ec.categoryId),
  )

  if (categoriasDoGerente.length === 0) {
    return null
  }

  const payment = evento.payments[0] || null

  return {
    id: evento.id,
    name: evento.name,
    date: evento.date,
    location: evento.location,
    type: evento.type,
    description: evento.description,
    categorias: categoriasDoGerente.map((ec) => ({
      id: ec.category.id,
      name: ec.category.name,
    })),
    paymentId: payment?.id || null,
    paymentItems: payment
      ? payment.items.map((item) => ({
          id: item.id,
          name: item.name,
          value: item.value,
          quantityEnabled: item.quantityEnabled,
          required: item.required,
        }))
      : [],
  }
}

export async function getAtletasDoEventoGerente(eventoId: string): Promise<AtletaEventoDTO[]> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return []
  }

  // Busca o evento e suas categorias
  const evento = await prisma.event.findUnique({
    where: { id: eventoId },
    include: {
      categories: true,
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
  })

  if (!evento) {
    return []
  }

  // Filtra apenas categorias do gerente
  const eventoCategoryIds = evento.categories
    .filter((ec) => session.categoryIds?.includes(ec.categoryId))
    .map((ec) => ec.categoryId)

  if (eventoCategoryIds.length === 0) {
    return []
  }

  const payment = evento.payments[0] || null

  // Busca apenas atletas das categorias do gerente que pertencem ao evento
  const atletas = await prisma.athlete.findMany({
    where: {
      categories: {
        some: {
          categoryId: {
            in: eventoCategoryIds,
          },
        },
      },
    },
    include: {
      categories: true,
      attendances: {
        where: {
          eventId: eventoId,
        },
        include: {
          paymentItems: {
            include: {
              paymentItem: true,
            },
          },
        },
      },
    },
    orderBy: {
      firstName: "asc",
    },
  })

  // Mapeia os itens de pagamento disponíveis
  const paymentItemsMap = payment
    ? new Map(payment.items.map((item) => [item.id, item]))
    : new Map()

  return atletas.map((atleta) => {
    const attendance = atleta.attendances[0] || null
    const attendancePaymentItems = attendance?.paymentItems || []

    // Cria um mapa dos itens pagos do atleta
    const paidItemsMap = new Map(
      attendancePaymentItems.map((pi) => [
        pi.paymentItemId,
        {
          confirmedQuantity: pi.confirmedQuantity,
          paidQuantity: pi.paidQuantity,
          paid: pi.paid,
          paidAt: pi.paidAt,
        },
      ]),
    )

    // Mapeia todos os itens de pagamento disponíveis (filtra despesas fixas)
    const items = payment
      ? payment.items
          .filter((item) => !item.isFixed) // Filtra despesas fixas (não exibidas para atletas)
          .map((item) => {
            const athleteItem = paidItemsMap.get(item.id)
            return {
              id: item.id,
              name: item.name,
              value: item.value,
              quantityEnabled: item.quantityEnabled,
              required: item.required,
              confirmedQuantity: athleteItem?.confirmedQuantity || 0,
              paidQuantity: athleteItem?.paidQuantity || 0,
              paid: athleteItem?.paid || false,
              paidAt: athleteItem?.paidAt || null,
            }
          })
      : []

    return {
      id: atleta.id,
      firstName: atleta.firstName,
      lastName: atleta.lastName,
      phone: atleta.phone,
      shirtNumber: atleta.shirtNumber,
      confirmed: attendance?.confirmed || false,
      confirmedAt: attendance?.confirmedAt || null,
      paymentItems: items,
      attendanceId: attendance?.id || null,
    }
  })
}

