import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

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

export async function getEventosAnalyticsGerente(): Promise<EventoAnalyticsDTO[]> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return []
  }

  // Busca apenas eventos das categorias do gerente
  const eventos = await prisma.event.findMany({
    where: {
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
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

  // Busca apenas atletas das categorias do gerente
  const atletas = await prisma.athlete.findMany({
    where: {
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
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

  // Busca confirmações de presença apenas dos eventos do gerente
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

    // Filtra atletas que pertencem às categorias do evento e do gerente
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
      categorias: evento.categories
        .filter((ec) => session.categoryIds?.includes(ec.categoryId))
        .map((ec) => ({
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

