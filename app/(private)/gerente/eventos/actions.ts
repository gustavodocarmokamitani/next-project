"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function createEventoGerente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  const name = formData.get("nome")
  const date = formData.get("data")
  const location = formData.get("local")
  const type = formData.get("tipo")
  const description = formData.get("descricao")
  const categorias = formData.getAll("categorias")

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect("/gerente/eventos/adicionar?error=Nome do evento é obrigatório.")
  }

  if (!date || typeof date !== "string") {
    redirect("/gerente/eventos/adicionar?error=Data é obrigatória.")
  }

  if (!type || typeof type !== "string" || type.trim().length === 0) {
    redirect("/gerente/eventos/adicionar?error=Tipo do evento é obrigatório.")
  }

  if (categorias.length === 0) {
    redirect("/gerente/eventos/adicionar?error=Selecione pelo menos uma categoria.")
  }

  // Valida se as categorias selecionadas são das categorias do gerente
  const categoriasSelecionadas = categorias as string[]
  const categoriasInvalidas = categoriasSelecionadas.filter(
    (catId) => !session.categoryIds?.includes(catId),
  )

  if (categoriasInvalidas.length > 0) {
    redirect("/gerente/eventos/adicionar?error=Você não pode criar eventos em categorias que não gerencia.")
  }

  const dateObj = new Date(date)

  // Busca o organizationId do gerente
  if (!session.organizationId) {
    redirect("/gerente/eventos/adicionar?error=Organização não encontrada.")
  }

  // Cria o evento
  const evento = await prisma.event.create({
    data: {
      name: name.trim(),
      date: dateObj,
      location: location && typeof location === "string" ? location.trim() : null,
      type: type.trim(),
      description: description && typeof description === "string" ? description.trim() : null,
      organizationId: session.organizationId,
      categories: {
        create: categoriasSelecionadas.map((catId) => ({
          categoryId: catId,
        })),
      },
    },
  })

  // Cria despesa automaticamente para eventos do gerente
  if (categoriasSelecionadas.length > 0) {
    // Define vencimento como 7 dias após a data do evento
    const dueDate = new Date(dateObj)
    dueDate.setDate(dueDate.getDate() + 7)

    const payment = await prisma.payment.create({
      data: {
        name: `Pagamento - ${name.trim()}`,
        dueDate,
        eventId: evento.id,
        categories: {
          create: categoriasSelecionadas.map((catId) => ({
            categoryId: catId,
          })),
        },
      },
    })

    revalidatePath("/gerente/eventos")
    revalidatePath("/gerente/despesas")
    redirect(`/gerente/despesas/${payment.id}/itens?success=Evento e despesa criados com sucesso! Agora adicione os itens.`)
  }

  revalidatePath("/gerente/eventos")
  redirect("/gerente/eventos?success=Evento criado com sucesso!")
}

export async function updateEventoGerente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  const id = formData.get("id")
  const name = formData.get("nome")
  const date = formData.get("data")
  const location = formData.get("local")
  const type = formData.get("tipo")
  const description = formData.get("descricao")
  const categorias = formData.getAll("categorias")

  if (!id || typeof id !== "string") {
    redirect("/gerente/eventos?error=ID inválido.")
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect(`/gerente/eventos/editar/${id}?error=Nome do evento é obrigatório.`)
  }

  if (!date || typeof date !== "string") {
    redirect(`/gerente/eventos/editar/${id}?error=Data é obrigatória.`)
  }

  if (!type || typeof type !== "string" || type.trim().length === 0) {
    redirect(`/gerente/eventos/editar/${id}?error=Tipo do evento é obrigatório.`)
  }

  if (categorias.length === 0) {
    redirect(`/gerente/eventos/editar/${id}?error=Selecione pelo menos uma categoria.`)
  }

  // Verifica se o evento existe e está em uma categoria do gerente
  const evento = await prisma.event.findFirst({
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

  if (!evento) {
    redirect(`/gerente/eventos/editar/${id}?error=Evento não encontrado ou você não tem permissão para editá-lo.`)
  }

  // Valida se as categorias selecionadas são das categorias do gerente
  const categoriasSelecionadas = categorias as string[]
  const categoriasInvalidas = categoriasSelecionadas.filter(
    (catId) => !session.categoryIds?.includes(catId),
  )

  if (categoriasInvalidas.length > 0) {
    redirect(`/gerente/eventos/editar/${id}?error=Você não pode criar eventos em categorias que não gerencia.`)
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
        create: categoriasSelecionadas.map((catId) => ({
          categoryId: catId,
        })),
      },
    },
  })

  revalidatePath("/gerente/eventos")
  redirect("/gerente/eventos?success=Evento atualizado com sucesso!")
}

export async function deleteEventoGerente(id: string) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  if (!id || typeof id !== "string") {
    redirect("/gerente/eventos?error=ID inválido.")
  }

  // Verifica se o evento existe e está em uma categoria do gerente
  const evento = await prisma.event.findFirst({
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

  if (!evento) {
    redirect("/gerente/eventos?error=Evento não encontrado ou você não tem permissão para deletá-lo.")
  }

  await prisma.event.delete({
    where: { id },
  })

  revalidatePath("/gerente/eventos")
  redirect("/gerente/eventos?success=Evento deletado com sucesso!")
}

