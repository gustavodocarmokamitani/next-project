"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { randomBytes } from "crypto"

export async function createCampeonatoConvite(
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
    redirect(
      `/home/campeonatos/${campeonatoId}/convites?error=Campeonato não encontrado.`,
    )
  }

  const diasExpiracao = formData.get("diasExpiracao")

  // Verifica se já existe um convite público ativo para este campeonato
  const conviteExistente = await (prisma as any).championshipInvite.findFirst({
    where: {
      championshipId: campeonatoId,
      organizationId: null, // Convite público
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (conviteExistente) {
    redirect(
      `/home/campeonatos/${campeonatoId}/convites?error=Já existe um convite público ativo para este campeonato.`,
    )
  }

  // Gera token único
  const token = randomBytes(32).toString("hex")

  // Calcula data de expiração (padrão: 30 dias)
  const dias = diasExpiracao
    ? parseInt(diasExpiracao.toString())
    : 30
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + dias)

  await (prisma as any).championshipInvite.create({
    data: {
      championshipId: campeonatoId,
      organizationId: null, // Convite público - qualquer organização pode aceitar
      token,
      expiresAt,
      used: false,
    },
  })

  revalidatePath(`/home/campeonatos/${campeonatoId}/convites`)
  redirect(
    `/home/campeonatos/${campeonatoId}/convites?success=Convite criado com sucesso!`,
  )
}

export async function deleteCampeonatoConvite(
  campeonatoId: string,
  conviteId: string,
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
    redirect(
      `/home/campeonatos/${campeonatoId}/convites?error=Campeonato não encontrado.`,
    )
  }

  // Verifica se o convite pertence ao campeonato
  const convite = await (prisma as any).championshipInvite.findFirst({
    where: {
      id: conviteId,
      championshipId: campeonatoId,
    },
    select: { id: true },
  })

  if (!convite) {
    redirect(
      `/home/campeonatos/${campeonatoId}/convites?error=Convite não encontrado.`,
    )
  }

  await (prisma as any).championshipInvite.delete({
    where: { id: conviteId },
  })

  revalidatePath(`/home/campeonatos/${campeonatoId}/convites`)
  redirect(
    `/home/campeonatos/${campeonatoId}/convites?success=Convite deletado com sucesso!`,
  )
}

