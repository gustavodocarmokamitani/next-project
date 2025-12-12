import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type ConvitePendenteDTO = {
  id: string
  championshipId: string
  championshipName: string
  championshipDescription: string | null
  championshipStartDate: Date
  championshipEndDate: Date | null
  championshipLocation: string | null
  organizerName: string
  token: string
  expiresAt: Date
  createdAt: Date
}

export async function getConvitesPendentes(): Promise<ConvitePendenteDTO[]> {
  const session = await getSession()

  if (!session || !session.organizationId || session.role !== "ADMIN") {
    return []
  }

  // Busca convites públicos (organizationId null) que ainda não foram aceitos por esta organização
  // e que ainda não expiraram
  const convitesPublicos = await (prisma as any).championshipInvite.findMany({
    where: {
      organizationId: null, // Convites públicos
      expiresAt: {
        gt: new Date(), // Ainda não expirou
      },
    },
    include: {
      championship: {
        include: {
          organizer: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Filtra para garantir que a organização realmente não aceitou
  const convitesNaoAceitos = await Promise.all(
    convitesPublicos.map(async (convite: any) => {
      const aceiteExistente = await (prisma as any).championshipInvite.findFirst({
        where: {
          championshipId: convite.championshipId,
          organizationId: session.organizationId,
          token: convite.token,
        },
      })

      return !aceiteExistente ? convite : null
    }),
  )

  return convitesNaoAceitos
    .filter((c): c is any => c !== null && c.championship?.organizer !== null)
    .map((convite: any) => ({
      id: convite.id,
      championshipId: convite.championshipId,
      championshipName: convite.championship.name,
      championshipDescription: convite.championship.description,
      championshipStartDate: convite.championship.startDate,
      championshipEndDate: convite.championship.endDate,
      championshipLocation: convite.championship.location,
      organizerName: convite.championship.organizer?.name || "Organizador não encontrado",
      token: convite.token,
      expiresAt: convite.expiresAt,
      createdAt: convite.createdAt,
    }))
}

