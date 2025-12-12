"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function acceptConvitePendente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.organizationId || session.role !== "ADMIN") {
    redirect("/login")
  }

  const token = formData.get("token")

  if (!token || typeof token !== "string") {
    redirect("/home/campeonatos?error=Token inválido.")
  }

  // Busca o convite público (organizationId null) com este token
  const convite = await (prisma as any).championshipInvite.findFirst({
    where: {
      token,
      organizationId: null, // Convite público
      expiresAt: {
        gt: new Date(), // Ainda não expirou
      },
    },
    include: {
      championship: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!convite) {
    redirect("/home/campeonatos?error=Convite não encontrado ou expirado.")
  }

  // Verifica se já aceitou
  const aceiteExistente = await (prisma as any).championshipInvite.findFirst({
    where: {
      championshipId: convite.championshipId,
      organizationId: session.organizationId,
      token: token,
    },
  })

  if (aceiteExistente) {
    redirect("/home/campeonatos?error=Você já aceitou este convite.")
  }

  // Cria o registro de aceite
  await (prisma as any).championshipInvite.create({
    data: {
      championshipId: convite.championshipId,
      organizationId: session.organizationId,
      token: token,
      expiresAt: convite.expiresAt,
      used: true,
      usedAt: new Date(),
    },
  })

  revalidatePath("/home/campeonatos")
  redirect("/home/campeonatos?success=Convite aceito com sucesso!")
}

