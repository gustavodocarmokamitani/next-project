"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createDespesa(formData: FormData) {
  const name = formData.get("nome")
  const dueDate = formData.get("vencimento")
  const eventId = formData.get("evento")

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect("/home/despesas/adicionar?error=Nome do pagamento é obrigatório.")
  }

  if (!dueDate || typeof dueDate !== "string") {
    redirect("/home/despesas/adicionar?error=Data de vencimento é obrigatória.")
  }

  const dueDateObj = new Date(dueDate)

  // Se houver evento, busca as categorias do evento
  let categoryIds: string[] = []
  
  if (eventId && typeof eventId === "string" && eventId.trim() !== "") {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        categories: true,
      },
    })

    if (!event) {
      redirect("/home/despesas/adicionar?error=Evento não encontrado.")
    }

    if (event.categories.length === 0) {
      redirect("/home/despesas/adicionar?error=O evento selecionado não possui categorias associadas.")
    }

    categoryIds = event.categories.map((ec) => ec.categoryId)
  } else {
    // Se não houver evento, precisa ter pelo menos uma categoria selecionada
    const categoria = formData.get("categoria")
    if (!categoria || typeof categoria !== "string") {
      redirect("/home/despesas/adicionar?error=Selecione uma categoria ou um evento.")
    }
    categoryIds = [categoria]
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

  revalidatePath("/home/despesas")
  redirect(`/home/despesas/${payment.id}/itens?success=Despesa criada com sucesso!`)
}

export async function updateDespesa(formData: FormData) {
  const id = formData.get("id")
  const name = formData.get("nome")
  const dueDate = formData.get("vencimento")
  const eventId = formData.get("evento")

  if (!id || typeof id !== "string") {
    redirect("/home/despesas?error=ID inválido.")
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect(`/home/despesas/editar/${id}?error=Nome do pagamento é obrigatório.`)
  }

  if (!dueDate || typeof dueDate !== "string") {
    redirect(`/home/despesas/editar/${id}?error=Data de vencimento é obrigatória.`)
  }

  const dueDateObj = new Date(dueDate)

  // Se houver evento, busca as categorias do evento
  let categoryIds: string[] = []
  
  if (eventId && typeof eventId === "string" && eventId.trim() !== "") {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        categories: true,
      },
    })

    if (!event) {
      redirect(`/home/despesas/editar/${id}?error=Evento não encontrado.`)
    }

    if (event.categories.length === 0) {
      redirect(`/home/despesas/editar/${id}?error=O evento selecionado não possui categorias associadas.`)
    }

    categoryIds = event.categories.map((ec) => ec.categoryId)
  } else {
    // Se não houver evento, precisa ter pelo menos uma categoria selecionada
    const categoria = formData.get("categoria")
    if (!categoria || typeof categoria !== "string") {
      redirect(`/home/despesas/editar/${id}?error=Selecione uma categoria ou um evento.`)
    }
    categoryIds = [categoria]
  }

  await prisma.payment.update({
    where: { id },
    data: {
      name: name.trim(),
      dueDate: dueDateObj,
      eventId: eventId && typeof eventId === "string" && eventId.trim() !== "" ? eventId : null,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
  })

  revalidatePath("/home/despesas")
  redirect("/home/despesas?success=Despesa atualizada com sucesso!")
}

export async function deleteDespesa(id: string) {
  if (!id || typeof id !== "string") {
    redirect("/home/despesas?error=ID inválido.")
  }

  await prisma.payment.delete({
    where: { id },
  })

  revalidatePath("/home/despesas")
  redirect("/home/despesas?success=Despesa deletada com sucesso!")
}

export async function addItemToDespesa(formData: FormData) {
  const paymentId = formData.get("paymentId")
  const name = formData.get("nome")
  const value = formData.get("valor")
  const quantityEnabled = formData.get("quantityEnabled") === "on"
  const required = formData.get("required") === "on"
  const isFixed = formData.get("isFixed") === "on"

  if (!paymentId || typeof paymentId !== "string") {
    redirect("/home/despesas?error=ID da despesa inválido.")
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect(`/home/despesas/${paymentId}/itens?error=Nome do item é obrigatório.`)
  }

  if (!value || typeof value !== "string") {
    redirect(`/home/despesas/${paymentId}/itens?error=Valor do item é obrigatório.`)
  }

  const valueNum = parseFloat(value)
  if (isNaN(valueNum) || valueNum < 0) {
    redirect(`/home/despesas/${paymentId}/itens?error=Valor inválido.`)
  }

  await prisma.paymentItem.create({
    data: {
      name: name.trim(),
      value: valueNum,
      quantityEnabled,
      required,
      isFixed,
      paymentId,
    },
  })

  revalidatePath("/home/despesas")
  revalidatePath(`/home/despesas/${paymentId}/itens`)
  redirect(`/home/despesas/${paymentId}/itens?success=Item adicionado com sucesso!`)
}

export async function deleteItemFromDespesa(itemId: string, paymentId: string) {
  if (!itemId || typeof itemId !== "string") {
    redirect(`/home/despesas/${paymentId}/itens?error=ID do item inválido.`)
  }

  await prisma.paymentItem.delete({
    where: { id: itemId },
  })

  revalidatePath("/home/despesas")
  revalidatePath(`/home/despesas/${paymentId}/itens`)
  redirect(`/home/despesas/${paymentId}/itens?success=Item deletado com sucesso!`)
}

