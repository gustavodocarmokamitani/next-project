"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function createDespesaGerente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  const name = formData.get("nome")
  const dueDate = formData.get("vencimento")
  const eventId = formData.get("evento")

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect("/gerente/despesas/adicionar?error=Nome do pagamento é obrigatório.")
  }

  if (!dueDate || typeof dueDate !== "string") {
    redirect("/gerente/despesas/adicionar?error=Data de vencimento é obrigatória.")
  }

  const dueDateObj = new Date(dueDate)

  // Se houver evento, busca as categorias do evento e valida se são do gerente
  let categoryIds: string[] = []
  
  if (eventId && typeof eventId === "string" && eventId.trim() !== "") {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        categories: {
          some: {
            categoryId: {
              in: session.categoryIds,
            },
          },
        },
      },
      include: {
        categories: true,
      },
    })

    if (!event) {
      redirect("/gerente/despesas/adicionar?error=Evento não encontrado ou você não tem permissão para usá-lo.")
    }

    if (event.categories.length === 0) {
      redirect("/gerente/despesas/adicionar?error=O evento selecionado não possui categorias associadas.")
    }

    // Só usa as categorias do gerente que estão no evento
    categoryIds = event.categories
      .map((ec) => ec.categoryId)
      .filter((catId) => session.categoryIds?.includes(catId))
  } else {
    // Se não houver evento, precisa ter pelo menos uma categoria selecionada
    const categoria = formData.get("categoria")
    if (!categoria || typeof categoria !== "string") {
      redirect("/gerente/despesas/adicionar?error=Selecione uma categoria ou um evento.")
    }

    // Valida se a categoria é do gerente
    if (!session.categoryIds?.includes(categoria)) {
      redirect("/gerente/despesas/adicionar?error=Você não pode criar despesas em categorias que não gerencia.")
    }

    categoryIds = [categoria]
  }

  if (categoryIds.length === 0) {
    redirect("/gerente/despesas/adicionar?error=Nenhuma categoria válida encontrada.")
  }

  const payment = await prisma.payment.create({
    data: {
      name: name.trim(),
      dueDate: dueDateObj,
      eventId: eventId && typeof eventId === "string" && eventId.trim() !== "" ? eventId : null,
      categories: {
        create: categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
  })

  revalidatePath("/gerente/despesas")
  redirect(`/gerente/despesas/${payment.id}/itens?success=Despesa criada com sucesso!`)
}

export async function deleteDespesaGerente(id: string) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  if (!id || typeof id !== "string") {
    redirect("/gerente/despesas?error=ID inválido.")
  }

  // Verifica se a despesa existe e está em uma categoria do gerente
  const payment = await prisma.payment.findFirst({
    where: {
      id,
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
          },
        },
      },
    },
  })

  if (!payment) {
    redirect("/gerente/despesas?error=Despesa não encontrada ou você não tem permissão para deletá-la.")
  }

  await prisma.payment.delete({
    where: { id },
  })

  revalidatePath("/gerente/despesas")
  redirect("/gerente/despesas?success=Despesa deletada com sucesso!")
}

export async function addItemToDespesaGerente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  const paymentId = formData.get("paymentId")
  const name = formData.get("nome")
  const value = formData.get("valor")
  const quantityEnabled = formData.get("quantityEnabled") === "on"
  const required = formData.get("required") === "on"

  if (!paymentId || typeof paymentId !== "string") {
    redirect("/gerente/despesas?error=ID da despesa inválido.")
  }

  // Verifica se a despesa pertence a uma categoria do gerente
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
          },
        },
      },
    },
  })

  if (!payment) {
    redirect(`/gerente/despesas/${paymentId}/itens?error=Despesa não encontrada ou você não tem permissão para editá-la.`)
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect(`/gerente/despesas/${paymentId}/itens?error=Nome do item é obrigatório.`)
  }

  if (!value || typeof value !== "string") {
    redirect(`/gerente/despesas/${paymentId}/itens?error=Valor do item é obrigatório.`)
  }

  const valueNum = parseFloat(value)
  if (isNaN(valueNum) || valueNum < 0) {
    redirect(`/gerente/despesas/${paymentId}/itens?error=Valor inválido.`)
  }

  await prisma.paymentItem.create({
    data: {
      name: name.trim(),
      value: valueNum,
      quantityEnabled,
      required,
      paymentId,
    },
  })

  revalidatePath("/gerente/despesas")
  revalidatePath(`/gerente/despesas/${paymentId}/itens`)
  redirect(`/gerente/despesas/${paymentId}/itens?success=Item adicionado com sucesso!`)
}

export async function deleteItemFromDespesaGerente(itemId: string, paymentId: string) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  if (!itemId || typeof itemId !== "string") {
    redirect(`/gerente/despesas/${paymentId}/itens?error=ID do item inválido.`)
  }

  // Verifica se a despesa pertence a uma categoria do gerente
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
          },
        },
      },
    },
  })

  if (!payment) {
    redirect(`/gerente/despesas/${paymentId}/itens?error=Despesa não encontrada ou você não tem permissão para editá-la.`)
  }

  await prisma.paymentItem.delete({
    where: { id: itemId },
  })

  revalidatePath("/gerente/despesas")
  revalidatePath(`/gerente/despesas/${paymentId}/itens`)
  redirect(`/gerente/despesas/${paymentId}/itens?success=Item deletado com sucesso!`)
}

