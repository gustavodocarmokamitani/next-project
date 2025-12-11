"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import bcrypt from "bcryptjs"

export async function confirmarPresenca(
  eventId: string,
  items?: { itemId: string; quantity: number }[],
) {
  const session = await getSession()

  if (!session || session.role !== "ATLETA" || !session.athleteId) {
    redirect("/login")
  }

  // Busca a despesa do evento (se houver)
  const payment = await prisma.payment.findFirst({
    where: {
      eventId,
    },
    include: {
      items: true,
    },
  })

  // Se não houver despesa, apenas confirma presença sem itens
  if (!payment || payment.items.length === 0) {
    let attendance = await prisma.eventAttendance.findUnique({
      where: {
        eventId_athleteId: {
          eventId,
          athleteId: session.athleteId,
        },
      },
    })

    if (attendance) {
      await prisma.eventAttendance.update({
        where: { id: attendance.id },
        data: {
          confirmed: true,
          confirmedAt: new Date(),
        },
      })
    } else {
      await prisma.eventAttendance.create({
        data: {
          eventId,
          athleteId: session.athleteId,
          confirmed: true,
          confirmedAt: new Date(),
        },
      })
    }

    revalidatePath("/atleta")
    redirect("/atleta?success=Presença confirmada com sucesso!")
    return
  }

  // Valida itens se fornecido
  if (!items || items.length === 0) {
    // Se há itens obrigatórios, precisa selecionar pelo menos eles
    const requiredItems = payment.items.filter((item) => item.required)
    if (requiredItems.length > 0) {
      redirect("/atleta?error=Selecione pelo menos os itens obrigatórios.")
    }
  }

  // Busca ou cria a attendance
  let attendance = await prisma.eventAttendance.findUnique({
    where: {
      eventId_athleteId: {
        eventId,
        athleteId: session.athleteId,
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
        eventId,
        athleteId: session.athleteId,
        confirmed: true,
        confirmedAt: now,
      },
    })
  }

  // Processa os itens selecionados
  const itemsToProcess = items || []
  const itemsMap = new Map(itemsToProcess.map((item) => [item.itemId, item.quantity]))

  // Para cada item da despesa
  for (const item of payment.items) {
    const quantity = itemsMap.get(item.id) || 0

    // Itens obrigatórios devem ter quantidade >= 1
    if (item.required && quantity < 1) {
      continue // Pula itens obrigatórios não selecionados (não deveria acontecer, mas protege)
    }

    // Se quantidade > 0, cria ou atualiza o registro
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
        // Atualiza quantidade confirmada
        await prisma.athletePaymentItem.update({
          where: { id: existing.id },
          data: {
            confirmedQuantity: quantity,
          },
        })
      } else {
        // Cria novo registro
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
      // Remove itens opcionais não selecionados (se existirem)
      await prisma.athletePaymentItem.deleteMany({
        where: {
          attendanceId: attendance.id,
          paymentItemId: item.id,
        },
      })
    }
  }

  revalidatePath("/atleta")
  redirect("/atleta?success=Presença confirmada com sucesso!")
}

export async function pagarDespesa(
  paymentId: string,
  items: { itemId: string; quantity: number }[],
) {
  const session = await getSession()

  if (!session || session.role !== "ATLETA" || !session.athleteId) {
    redirect("/login")
  }

  // Busca a despesa
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      items: true,
      event: true,
    },
  })

  if (!payment) {
    redirect("/atleta?error=Despesa não encontrada.")
  }

  // Se a despesa tem evento associado, usa a attendance desse evento
  // Caso contrário, busca a primeira attendance do atleta confirmada
  let attendance = null

  if (payment.eventId) {
    attendance = await prisma.eventAttendance.findUnique({
      where: {
        eventId_athleteId: {
          eventId: payment.eventId,
          athleteId: session.athleteId,
        },
      },
    })

    if (!attendance) {
      redirect("/atleta?error=Confirme sua presença no evento antes de pagar a despesa.")
    }
  } else {
    // Para despesas sem evento, busca a primeira attendance confirmada do atleta
    attendance = await prisma.eventAttendance.findFirst({
      where: {
        athleteId: session.athleteId,
        confirmed: true,
      },
    })

    if (!attendance) {
      redirect("/atleta?error=Confirme sua presença em um evento antes de pagar a despesa.")
    }
  }

  const paidAt = new Date()

  // Processa todos os itens da despesa
  for (const { itemId, quantity } of items) {
    // Verifica se o item existe e pertence à despesa
    const item = payment.items.find((i) => i.id === itemId)
    if (!item) {
      continue
    }

    // Para itens obrigatórios, garante quantidade mínima de 1
    const finalQuantity = item.required && quantity < 1 ? 1 : quantity

    if (finalQuantity <= 0) {
      continue // Pula itens com quantidade 0
    }

    // Busca ou cria o registro de pagamento
    const existing = await prisma.athletePaymentItem.findUnique({
      where: {
        attendanceId_paymentItemId: {
          attendanceId: attendance.id,
          paymentItemId: itemId,
        },
      },
    })

    if (existing) {
      // Atualiza pagamento (quantidade paga)
      await prisma.athletePaymentItem.update({
        where: { id: existing.id },
        data: {
          paid: true,
          paidQuantity: finalQuantity,
          paidAt,
        },
      })
    } else {
      // Cria novo registro de pagamento
      // Se não foi confirmado antes, usa a quantidade paga como confirmada também
      await prisma.athletePaymentItem.create({
        data: {
          attendanceId: attendance.id,
          paymentItemId: itemId,
          confirmedQuantity: finalQuantity,
          paidQuantity: finalQuantity,
          paid: true,
          paidAt,
        },
      })
    }
  }

  revalidatePath("/atleta")
  redirect("/atleta?success=Despesa paga com sucesso!")
}

export async function updateAtletaPerfil(formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "ATLETA" || !session.athleteId) {
    redirect("/login")
  }

  const id = formData.get("id")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")
  const federationId = formData.get("federationId")
  const confederationId = formData.get("confederationId")
  const birthDate = formData.get("birthDate")
  const shirtNumber = formData.get("shirtNumber")

  if (!id || typeof id !== "string" || id !== session.athleteId) {
    redirect("/atleta/configuracoes?error=ID inválido.")
  }

  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    redirect("/atleta/configuracoes?error=Nome é obrigatório.")
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect("/atleta/configuracoes?error=Sobrenome é obrigatório.")
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect("/atleta/configuracoes?error=Telefone é obrigatório.")
  }

  if (!birthDate || typeof birthDate !== "string") {
    redirect("/atleta/configuracoes?error=Data de nascimento é obrigatória.")
  }

  // Verifica se o telefone já está sendo usado por outro atleta
  const existingAthlete = await prisma.athlete.findUnique({
    where: { phone: phone.trim() },
  })

  if (existingAthlete && existingAthlete.id !== id) {
    redirect("/atleta/configuracoes?error=Este telefone já está em uso.")
  }

  const birthDateObj = new Date(birthDate)

  // Busca o userId do atleta
  const athlete = await prisma.athlete.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!athlete) {
    redirect("/atleta/configuracoes?error=Atleta não encontrado.")
  }

  // Atualiza o atleta (sem alterar categorias)
  await prisma.athlete.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      federationId: federationId && typeof federationId === "string" ? federationId.trim() : null,
      confederationId:
        confederationId && typeof confederationId === "string" ? confederationId.trim() : null,
      birthDate: birthDateObj,
      shirtNumber: shirtNumber && typeof shirtNumber === "string" ? shirtNumber.trim() : null,
    },
  })

  // Atualiza o nome e telefone no User também
  await prisma.user.update({
    where: { id: athlete.userId },
    data: {
      name: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim(),
    },
  })

  revalidatePath("/atleta")
  revalidatePath("/atleta/configuracoes")
  redirect("/atleta/configuracoes?success=Perfil atualizado com sucesso!")
}

export async function updateAtletaSenha(formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "ATLETA" || !session.athleteId) {
    redirect("/login")
  }

  const currentPassword = formData.get("currentPassword")
  const newPassword = formData.get("newPassword")
  const confirmPassword = formData.get("confirmPassword")

  if (!currentPassword || typeof currentPassword !== "string") {
    redirect("/atleta/configuracoes?error=Senha atual é obrigatória.")
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    redirect("/atleta/configuracoes?error=A nova senha deve ter no mínimo 6 caracteres.")
  }

  if (newPassword !== confirmPassword) {
    redirect("/atleta/configuracoes?error=As senhas não coincidem.")
  }

  // Busca o usuário do atleta
  const athlete = await prisma.athlete.findUnique({
    where: { id: session.athleteId },
    select: { userId: true },
  })

  if (!athlete) {
    redirect("/atleta/configuracoes?error=Atleta não encontrado.")
  }

  const user = await prisma.user.findUnique({
    where: { id: athlete.userId },
  })

  if (!user) {
    redirect("/atleta/configuracoes?error=Usuário não encontrado.")
  }

  // Verifica a senha atual
  const isValidPassword = await bcrypt.compare(currentPassword, user.password)

  if (!isValidPassword) {
    redirect("/atleta/configuracoes?error=Senha atual incorreta.")
  }

  // Criptografa a nova senha
  const newPasswordHash = await bcrypt.hash(newPassword, 10)

  // Atualiza a senha
  await prisma.user.update({
    where: { id: athlete.userId },
    data: {
      password: newPasswordHash,
    },
  })

  revalidatePath("/atleta/configuracoes")
  redirect("/atleta/configuracoes?success=Senha alterada com sucesso!")
}
