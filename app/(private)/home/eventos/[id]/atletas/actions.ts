"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function confirmarPresencaAtleta(
  eventoId: string,
  athleteId: string,
  items?: { itemId: string; quantity: number }[],
) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  // Busca o evento e a despesa
  const evento = await prisma.event.findUnique({
    where: { id: eventoId },
    include: {
      payments: {
        include: {
          items: true,
        },
      },
    },
  })

  if (!evento) {
    redirect(`/home/eventos/${eventoId}/atletas?error=Evento não encontrado.`)
  }

  // Busca ou cria a attendance
  let attendance = await prisma.eventAttendance.findUnique({
    where: {
      eventId_athleteId: {
        eventId: eventoId,
        athleteId,
      },
    },
  })

  const now = new Date()

  if (attendance) {
    // Atualiza confirmação
    attendance = await prisma.eventAttendance.update({
      where: { id: attendance.id },
      data: {
        confirmed: true,
        confirmedAt: now,
      },
    })
  } else {
    // Cria nova attendance
    attendance = await prisma.eventAttendance.create({
      data: {
        eventId: eventoId,
        athleteId,
        confirmed: true,
        confirmedAt: now,
      },
    })
  }

  // Se há itens e um pagamento, processa os itens
  const payment = evento.payments[0]
  if (payment && items && items.length > 0) {
    const itemsMap = new Map(items.map((item) => [item.itemId, item.quantity]))

    for (const item of payment.items) {
      const quantity = itemsMap.get(item.id) || 0

      if (item.required && quantity < 1) {
        continue
      }

      if (quantity > 0) {
        const existing = await prisma.athletePaymentItem.findUnique({
          where: {
            attendanceId_paymentItemId: {
              attendanceId: attendance.id,
              paymentItemId: item.id,
            },
          },
        })

        if (existing) {
          await prisma.athletePaymentItem.update({
            where: { id: existing.id },
            data: {
              confirmedQuantity: quantity,
            },
          })
        } else {
          await prisma.athletePaymentItem.create({
            data: {
              attendanceId: attendance.id,
              paymentItemId: item.id,
              confirmedQuantity: quantity,
              paidQuantity: 0,
              paid: false,
            },
          })
        }
      } else if (!item.required) {
        await prisma.athletePaymentItem.deleteMany({
          where: {
            attendanceId: attendance.id,
            paymentItemId: item.id,
          },
        })
      }
    }
  }

  revalidatePath(`/home/eventos/${eventoId}/atletas`)
  redirect(`/home/eventos/${eventoId}/atletas?success=Presença confirmada com sucesso!`)
}

export async function cancelarPresencaAtleta(eventoId: string, athleteId: string) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  const attendance = await prisma.eventAttendance.findUnique({
    where: {
      eventId_athleteId: {
        eventId: eventoId,
        athleteId,
      },
    },
  })

  if (attendance) {
    await prisma.eventAttendance.update({
      where: { id: attendance.id },
      data: {
        confirmed: false,
        confirmedAt: null,
      },
    })
  }

  revalidatePath(`/home/eventos/${eventoId}/atletas`)
  redirect(`/home/eventos/${eventoId}/atletas?success=Presença cancelada com sucesso!`)
}

export async function registrarPagamentoAtleta(
  eventoId: string,
  athleteId: string,
  items: { itemId: string; quantity: number }[],
) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  // Busca o evento e a despesa
  const evento = await prisma.event.findUnique({
    where: { id: eventoId },
    include: {
      payments: {
        include: {
          items: true,
        },
      },
    },
  })

  if (!evento || !evento.payments[0]) {
    redirect(`/home/eventos/${eventoId}/atletas?error=Evento ou pagamento não encontrado.`)
  }

  // Busca ou cria a attendance
  let attendance = await prisma.eventAttendance.findUnique({
    where: {
      eventId_athleteId: {
        eventId: eventoId,
        athleteId,
      },
    },
  })

  if (!attendance) {
    // Cria attendance se não existir
    attendance = await prisma.eventAttendance.create({
      data: {
        eventId: eventoId,
        athleteId,
        confirmed: true,
        confirmedAt: new Date(),
      },
    })
  }

  const payment = evento.payments[0]
  const paidAt = new Date()

  // Processa os itens pagos
  for (const { itemId, quantity } of items) {
    const item = payment.items.find((i) => i.id === itemId)
    if (!item || quantity <= 0) {
      continue
    }

    const existing = await prisma.athletePaymentItem.findUnique({
      where: {
        attendanceId_paymentItemId: {
          attendanceId: attendance.id,
          paymentItemId: itemId,
        },
      },
    })

    if (existing) {
      // Atualiza pagamento
      await prisma.athletePaymentItem.update({
        where: { id: existing.id },
        data: {
          paid: true,
          paidQuantity: quantity,
          paidAt,
          // Se não estava confirmado, confirma também
          confirmedQuantity:
            existing.confirmedQuantity > 0 ? existing.confirmedQuantity : quantity,
        },
      })
    } else {
      // Cria novo registro de pagamento
      await prisma.athletePaymentItem.create({
        data: {
          attendanceId: attendance.id,
          paymentItemId: itemId,
          confirmedQuantity: quantity,
          paidQuantity: quantity,
          paid: true,
          paidAt,
        },
      })
    }
  }

  revalidatePath(`/home/eventos/${eventoId}/atletas`)
  redirect(`/home/eventos/${eventoId}/atletas?success=Pagamento registrado com sucesso!`)
}

