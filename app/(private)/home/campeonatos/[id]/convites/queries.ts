import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CampeonatoConviteDTO = {
  id: string
  organizationId: string
  organizationName: string | null
  token: string
  expiresAt: Date
  used: boolean
  usedAt: Date | null
  createdAt: Date
}

export async function getCampeonatoConvites(
  campeonatoId: string,
): Promise<CampeonatoConviteDTO[]> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return []
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    return []
  }

  // Verifica se o campeonato pertence à organização (SYSTEM pode ver qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { id: campeonatoId }
    : { id: campeonatoId, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    return []
  }

  const convites = await (prisma as any).championshipInvite.findMany({
    where: {
      championshipId: campeonatoId,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return convites.map((convite: any) => ({
    id: convite.id,
    organizationId: convite.organizationId,
    organizationName: convite.organization?.name || null,
    token: convite.token,
    expiresAt: convite.expiresAt,
    used: convite.used,
    usedAt: convite.usedAt,
    createdAt: convite.createdAt,
  }))
}

export async function getCampeonatoConviteByToken(
  token: string,
): Promise<{
  id: string
  championshipId: string
  championshipName: string
  organizationId: string | null
  expiresAt: Date
  used: boolean
} | null> {
  const convite = await (prisma as any).championshipInvite.findUnique({
    where: { token },
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
    return null
  }

  return {
    id: convite.id,
    championshipId: convite.championshipId,
    championshipName: convite.championship.name,
    organizationId: convite.organizationId,
    expiresAt: convite.expiresAt,
    used: convite.used,
  }
}

