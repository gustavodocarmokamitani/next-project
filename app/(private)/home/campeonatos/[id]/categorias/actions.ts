"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function createCampeonatoCategoria(
  campeonatoId: string,
  formData: FormData,
) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    redirect("/login")
  }

  // Verifica se o campeonato pertence à organização (SYSTEM pode acessar qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { id: campeonatoId }
    : { id: campeonatoId, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    redirect(`/home/campeonatos/${campeonatoId}/categorias?error=Campeonato não encontrado.`)
  }

  const nome = formData.get("nome")
  const categoriaGlobalId = formData.get("categoriaGlobalId")
  const allowUpgrade = formData.get("allowUpgrade") === "on"

  // Se foi selecionada uma categoria global, verifica se ela existe e pertence à organização
  let categoriaId: string | null = null
  let nomeFinal: string

  if (categoriaGlobalId && typeof categoriaGlobalId === "string" && categoriaGlobalId.trim() !== "") {
    const categoriaGlobal = await prisma.category.findFirst({
      where: {
        id: categoriaGlobalId.trim(),
        organizationId: session.organizationId,
      },
      select: { id: true, name: true },
    })

    if (!categoriaGlobal) {
      redirect(
        `/home/campeonatos/${campeonatoId}/categorias/adicionar?error=Categoria global não encontrada.`,
      )
    }

    categoriaId = categoriaGlobal.id
    nomeFinal = categoriaGlobal.name
  } else {
    // Categoria custom - valida o nome
    if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
      redirect(
        `/home/campeonatos/${campeonatoId}/categorias/adicionar?error=Nome da categoria é obrigatório.`,
      )
    }
    nomeFinal = nome.trim()
  }

  await (prisma as any).championshipCategory.create({
    data: {
      championshipId: campeonatoId,
      categoryId: categoriaId,
      name: nomeFinal,
      allowUpgrade,
    },
  })

  revalidatePath(`/home/campeonatos/${campeonatoId}/categorias`)
  redirect(
    `/home/campeonatos/${campeonatoId}/categorias?success=Categoria adicionada com sucesso!`,
  )
}

export async function updateCampeonatoCategoria(
  campeonatoId: string,
  categoriaId: string,
  formData: FormData,
) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    redirect("/login")
  }

  // Verifica se o campeonato pertence à organização (SYSTEM pode acessar qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { id: campeonatoId }
    : { id: campeonatoId, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    redirect(`/home/campeonatos/${campeonatoId}/categorias?error=Campeonato não encontrado.`)
  }

  // Verifica se a categoria pertence ao campeonato
  const categoria = await (prisma as any).championshipCategory.findFirst({
    where: {
      id: categoriaId,
      championshipId: campeonatoId,
    },
    select: { id: true },
  })

  if (!categoria) {
    redirect(
      `/home/campeonatos/${campeonatoId}/categorias?error=Categoria não encontrada.`,
    )
  }

  const nome = formData.get("nome")
  const categoriaGlobalId = formData.get("categoriaGlobalId")
  const allowUpgrade = formData.get("allowUpgrade") === "on"

  // Se foi selecionada uma categoria global, verifica se ela existe e pertence à organização
  let novaCategoriaId: string | null = null
  let nomeFinal: string

  if (categoriaGlobalId && typeof categoriaGlobalId === "string" && categoriaGlobalId.trim() !== "") {
    const categoriaGlobal = await prisma.category.findFirst({
      where: {
        id: categoriaGlobalId.trim(),
        organizationId: session.organizationId,
      },
      select: { id: true, name: true },
    })

    if (!categoriaGlobal) {
      redirect(
        `/home/campeonatos/${campeonatoId}/categorias/editar/${categoriaId}?error=Categoria global não encontrada.`,
      )
    }

    novaCategoriaId = categoriaGlobal.id
    nomeFinal = categoriaGlobal.name
  } else {
    // Categoria custom - valida o nome
    if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
      redirect(
        `/home/campeonatos/${campeonatoId}/categorias/editar/${categoriaId}?error=Nome da categoria é obrigatório.`,
      )
    }
    nomeFinal = nome.trim()
  }

  await (prisma as any).championshipCategory.update({
    where: { id: categoriaId },
    data: {
      categoryId: novaCategoriaId,
      name: nomeFinal,
      allowUpgrade,
    },
  })

  revalidatePath(`/home/campeonatos/${campeonatoId}/categorias`)
  redirect(
    `/home/campeonatos/${campeonatoId}/categorias?success=Categoria atualizada com sucesso!`,
  )
}

export async function deleteCampeonatoCategoria(
  campeonatoId: string,
  categoriaId: string,
) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    redirect("/login")
  }

  // Verifica se o campeonato pertence à organização (SYSTEM pode acessar qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { id: campeonatoId }
    : { id: campeonatoId, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    redirect(`/home/campeonatos/${campeonatoId}/categorias?error=Campeonato não encontrado.`)
  }

  // Verifica se a categoria pertence ao campeonato
  const categoria = await (prisma as any).championshipCategory.findFirst({
    where: {
      id: categoriaId,
      championshipId: campeonatoId,
    },
    select: { id: true },
  })

  if (!categoria) {
    redirect(
      `/home/campeonatos/${campeonatoId}/categorias?error=Categoria não encontrada.`,
    )
  }

  await (prisma as any).championshipCategory.delete({
    where: { id: categoriaId },
  })

  revalidatePath(`/home/campeonatos/${campeonatoId}/categorias`)
  redirect(
    `/home/campeonatos/${campeonatoId}/categorias?success=Categoria deletada com sucesso!`,
  )
}

