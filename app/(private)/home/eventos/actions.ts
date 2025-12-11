"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createEvento(formData: FormData) {
  const name = formData.get("nome")
  const date = formData.get("data")
  const location = formData.get("local")
  const type = formData.get("tipo")
  const description = formData.get("descricao")
  const categorias = formData.getAll("categorias")
  const criarDespesa = formData.get("criarDespesa") === "on"
  const nomeDespesa = formData.get("nomeDespesa")
  const vencimentoDespesa = formData.get("vencimentoDespesa")

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect("/home/eventos/adicionar?error=Nome do evento é obrigatório.")
  }

  if (!date || typeof date !== "string") {
    redirect("/home/eventos/adicionar?error=Data é obrigatória.")
  }

  if (!type || typeof type !== "string" || type.trim().length === 0) {
    redirect("/home/eventos/adicionar?error=Tipo do evento é obrigatório.")
  }

  if (criarDespesa) {
    if (!nomeDespesa || typeof nomeDespesa !== "string" || nomeDespesa.trim().length === 0) {
      redirect("/home/eventos/adicionar?error=Nome da despesa é obrigatório quando criar despesa está marcado.")
    }

    if (!vencimentoDespesa || typeof vencimentoDespesa !== "string") {
      redirect("/home/eventos/adicionar?error=Data de vencimento da despesa é obrigatória.")
    }
  }

  const dateObj = new Date(date)

  // Cria o evento
  const evento = await prisma.event.create({
    data: {
      name: name.trim(),
      date: dateObj,
      location: location && typeof location === "string" ? location.trim() : null,
      type: type.trim(),
      description: description && typeof description === "string" ? description.trim() : null,
      categories: {
        create: categorias.map((catId) => ({
          categoryId: catId as string,
        })),
      },
    },
  })

  // Se criarDespesa estiver marcado, cria a despesa automaticamente
  if (criarDespesa && categorias.length > 0) {
    const dueDateObj = new Date(vencimentoDespesa as string)

    const payment = await prisma.payment.create({
      data: {
        name: (nomeDespesa as string).trim(),
        dueDate: dueDateObj,
        eventId: evento.id,
        categories: {
          create: categorias.map((catId) => ({
            categoryId: catId as string,
          })),
        },
      },
    })

    revalidatePath("/home/eventos")
    revalidatePath("/home/despesas")
    redirect(`/home/despesas/${payment.id}/itens?success=Evento e despesa criados com sucesso! Agora adicione os itens.`)
  }

  revalidatePath("/home/eventos")
  redirect("/home/eventos?success=Evento criado com sucesso!")
}

export async function updateEvento(formData: FormData) {
  const id = formData.get("id")
  const name = formData.get("nome")
  const date = formData.get("data")
  const location = formData.get("local")
  const type = formData.get("tipo")
  const description = formData.get("descricao")
  const categorias = formData.getAll("categorias")

  if (!id || typeof id !== "string") {
    redirect("/home/eventos?error=ID inválido.")
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect(`/home/eventos/editar/${id}?error=Nome do evento é obrigatório.`)
  }

  if (!date || typeof date !== "string") {
    redirect(`/home/eventos/editar/${id}?error=Data é obrigatória.`)
  }

  if (!type || typeof type !== "string" || type.trim().length === 0) {
    redirect(`/home/eventos/editar/${id}?error=Tipo do evento é obrigatório.`)
  }

  const dateObj = new Date(date)

  await prisma.event.update({
    where: { id },
    data: {
      name: name.trim(),
      date: dateObj,
      location: location && typeof location === "string" ? location.trim() : null,
      type: type.trim(),
      description: description && typeof description === "string" ? description.trim() : null,
      categories: {
        deleteMany: {},
        create: categorias.map((catId) => ({
          categoryId: catId as string,
        })),
      },
    },
  })

  revalidatePath("/home/eventos")
  redirect("/home/eventos?success=Evento atualizado com sucesso!")
}

export async function deleteEvento(id: string) {
  if (!id || typeof id !== "string") {
    redirect("/home/eventos?error=ID inválido.")
  }

  await prisma.event.delete({
    where: { id },
  })

  revalidatePath("/home/eventos")
  redirect("/home/eventos?success=Evento deletado com sucesso!")
}

