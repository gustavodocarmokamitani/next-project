"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function inscreverAtleta(
  campeonatoId: string,
  categoriaId: string,
  athleteId: string,
) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    redirect("/login")
  }

  // Verifica se a organização aceitou o convite (SYSTEM pode acessar qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { championshipId: campeonatoId, used: true }
    : { championshipId: campeonatoId, organizationId: session.organizationId, used: true }
  
  const convite = await (prisma as any).championshipInvite.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!convite && session.role !== "SYSTEM") {
    redirect(
      `/home/campeonatos/inscricoes/${campeonatoId}?error=Você não está inscrito neste campeonato.`,
    )
  }

  // Verifica se o atleta pertence à organização (SYSTEM pode ver qualquer atleta)
  const athleteWhereClause = session.role === "SYSTEM"
    ? { id: athleteId }
    : { id: athleteId, organizationId: session.organizationId }
  
  const atleta = await prisma.athlete.findFirst({
    where: athleteWhereClause,
    },
    select: { id: true },
  })

  if (!atleta) {
    redirect(
      `/home/campeonatos/inscricoes/${campeonatoId}?error=Atleta não encontrado.`,
    )
  }

  // Verifica se a categoria existe e pertence ao campeonato
  const categoria = await (prisma as any).championshipCategory.findFirst({
    where: {
      id: categoriaId,
      championshipId: campeonatoId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!categoria) {
    redirect(
      `/home/campeonatos/inscricoes/${campeonatoId}?error=Categoria não encontrada.`,
    )
  }

  // Verifica se o atleta pode participar desta categoria
  // Se allowUpgrade é false, o atleta precisa ter exatamente esta categoria
  // Se allowUpgrade é true, o atleta pode ter esta categoria ou uma categoria menor
  if (!categoria.allowUpgrade && categoria.categoryId) {
    // Verifica se o atleta tem a categoria global correspondente
    const temCategoria = await prisma.categoryAthlete.findFirst({
      where: {
        athleteId: athleteId,
        categoryId: categoria.categoryId,
      },
    })

    if (!temCategoria) {
      redirect(
        `/home/campeonatos/inscricoes/${campeonatoId}?error=Atleta não possui a categoria necessária para esta inscrição.`,
      )
    }
  }

  // Busca ou cria o ChampionshipEntry para esta organização e categoria
  let entry = await (prisma as any).championshipEntry.findFirst({
    where: {
      championshipId: campeonatoId,
      organizationId: session.organizationId,
      championshipCategoryId: categoriaId,
    },
  })

  if (!entry) {
    entry = await (prisma as any).championshipEntry.create({
      data: {
        championshipId: campeonatoId,
        organizationId: session.organizationId,
        championshipCategoryId: categoriaId,
      },
    })
  }

  // Verifica se o atleta já está inscrito
  const inscricaoExistente = await (prisma as any).championshipAthleteEntry.findFirst({
    where: {
      entryId: entry.id,
      athleteId: athleteId,
    },
  })

  if (inscricaoExistente) {
    redirect(
      `/home/campeonatos/inscricoes/${campeonatoId}?error=Atleta já está inscrito nesta categoria.`,
    )
  }

  // Cria a inscrição do atleta
  await (prisma as any).championshipAthleteEntry.create({
    data: {
      entryId: entry.id,
      athleteId: athleteId,
      confirmed: false,
    },
  })

  revalidatePath(`/home/campeonatos/inscricoes/${campeonatoId}`)
  redirect(
    `/home/campeonatos/inscricoes/${campeonatoId}?success=Atleta inscrito com sucesso!`,
  )
}

export async function removerInscricao(
  campeonatoId: string,
  categoriaId: string,
  athleteId: string,
) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    redirect("/login")
  }

  // Busca o entry
  const entry = await (prisma as any).championshipEntry.findFirst({
    where: {
      championshipId: campeonatoId,
      organizationId: session.organizationId,
      championshipCategoryId: categoriaId,
    },
  })

  if (!entry) {
    redirect(
      `/home/campeonatos/inscricoes/${campeonatoId}?error=Inscrição não encontrada.`,
    )
  }

  // Remove a inscrição do atleta
  await (prisma as any).championshipAthleteEntry.deleteMany({
    where: {
      entryId: entry.id,
      athleteId: athleteId,
    },
  })

  revalidatePath(`/home/campeonatos/inscricoes/${campeonatoId}`)
  redirect(
    `/home/campeonatos/inscricoes/${campeonatoId}?success=Inscrição removida com sucesso!`,
  )
}

export async function confirmarInscricao(
  campeonatoId: string,
  categoriaId: string,
  athleteId: string,
) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    redirect("/login")
  }

  // Busca o entry
  const entry = await (prisma as any).championshipEntry.findFirst({
    where: {
      championshipId: campeonatoId,
      organizationId: session.organizationId,
      championshipCategoryId: categoriaId,
    },
  })

  if (!entry) {
    redirect(
      `/home/campeonatos/inscricoes/${campeonatoId}?error=Inscrição não encontrada.`,
    )
  }

  // Atualiza a confirmação
  await (prisma as any).championshipAthleteEntry.updateMany({
    where: {
      entryId: entry.id,
      athleteId: athleteId,
    },
    data: {
      confirmed: true,
      confirmedAt: new Date(),
    },
  })

  revalidatePath(`/home/campeonatos/inscricoes/${campeonatoId}`)
  redirect(
    `/home/campeonatos/inscricoes/${campeonatoId}?success=Inscrição confirmada com sucesso!`,
  )
}

