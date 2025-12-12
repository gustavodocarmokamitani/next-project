import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CampeonatoInscricaoDTO = {
  id: string
  nome: string
  descricao: string | null
  dataInicio: Date
  dataFim: Date | null
  local: string | null
  organizador: {
    id: string
    nome: string
  }
  categorias: {
    id: string
    nome: string
    allowUpgrade: boolean
  }[]
  createdAt: Date
}

export async function getCampeonatosInscritos(): Promise<CampeonatoInscricaoDTO[]> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return []
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    return []
  }

  // Busca campeonatos onde a organização aceitou convite
  // SYSTEM vê todos, ADMIN apenas da sua organização
  const whereClause = session.role === "SYSTEM"
    ? { used: true }
    : { organizationId: session.organizationId!, used: true }
  
  const convitesAceitos = await (prisma as any).championshipInvite.findMany({
    where: whereClause,
    include: {
      championship: {
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
            },
          },
          categories: {
            select: {
              id: true,
              name: true,
              allowUpgrade: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return convitesAceitos
    .filter((convite: any) => convite.championship?.organizer !== null)
    .map((convite: any) => ({
      id: convite.championship.id,
      nome: convite.championship.name,
      descricao: convite.championship.description,
      dataInicio: convite.championship.startDate,
      dataFim: convite.championship.endDate,
      local: convite.championship.location,
      organizador: {
        id: convite.championship.organizer.id,
        nome: convite.championship.organizer.name,
      },
      categorias: convite.championship.categories?.map((cat: any) => ({
        id: cat.id,
        nome: cat.name,
        allowUpgrade: cat.allowUpgrade,
      })) || [],
      createdAt: convite.championship.createdAt,
    }))
}

export async function getCampeonatoInscricaoById(
  campeonatoId: string,
): Promise<CampeonatoInscricaoDTO | null> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return null
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    return null
  }

  // Verifica se a organização aceitou o convite para este campeonato
  // SYSTEM pode ver qualquer campeonato, ADMIN apenas os que aceitou convite
  const whereClause = session.role === "SYSTEM"
    ? { championshipId: campeonatoId, used: true }
    : { championshipId: campeonatoId, organizationId: session.organizationId!, used: true }
  
  const convite = await (prisma as any).championshipInvite.findFirst({
    where: whereClause,
    include: {
      championship: {
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
            },
          },
          categories: {
            select: {
              id: true,
              name: true,
              allowUpgrade: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
      },
    },
  })

  if (!convite || !convite.championship?.organizer) {
    return null
  }

  return {
    id: convite.championship.id,
    nome: convite.championship.name,
    descricao: convite.championship.description,
    dataInicio: convite.championship.startDate,
    dataFim: convite.championship.endDate,
    local: convite.championship.location,
    organizador: {
      id: convite.championship.organizer.id,
      nome: convite.championship.organizer.name,
    },
    categorias: convite.championship.categories?.map((cat: any) => ({
      id: cat.id,
      nome: cat.name,
      allowUpgrade: cat.allowUpgrade,
    })) || [],
    createdAt: convite.championship.createdAt,
  }
}

