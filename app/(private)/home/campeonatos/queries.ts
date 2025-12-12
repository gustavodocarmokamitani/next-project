import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CampeonatoDTO = {
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
  createdAt: Date
}

export async function getCampeonatos(): Promise<CampeonatoDTO[]> {
  const session = await getSession()
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return []
  }

  // Se for ADMIN, precisa ter organizationId
  if (session.role === "ADMIN" && !session.organizationId) {
    return []
  }

  // SYSTEM pode ver todos, ADMIN apenas da sua organização
  const whereClause = session.role === "SYSTEM" 
    ? {} 
    : { organizerId: session.organizationId! }

  // Busca campeonatos (SYSTEM vê todos, ADMIN apenas da sua organização)
  const campeonatos = await (prisma as any).championship.findMany({
    where: whereClause,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  })

  return campeonatos
    .filter((campeonato: any) => campeonato.organizer !== null) // Filtra campeonatos sem organizador (caso existam dados inconsistentes)
    .map((campeonato: any): CampeonatoDTO => ({
      id: campeonato.id,
      nome: campeonato.name,
      descricao: campeonato.description,
      dataInicio: campeonato.startDate,
      dataFim: campeonato.endDate,
      local: campeonato.location,
      organizador: {
        id: campeonato.organizer.id,
        nome: campeonato.organizer.name,
      },
      createdAt: campeonato.createdAt,
    }))
}

export async function getCampeonatoById(id: string): Promise<CampeonatoDTO | null> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return null
  }

  // Se for ADMIN, precisa ter organizationId
  if (session.role === "ADMIN" && !session.organizationId) {
    return null
  }

  // SYSTEM pode ver qualquer campeonato, ADMIN apenas da sua organização
  const whereClause = session.role === "SYSTEM"
    ? { id }
    : { id, organizerId: session.organizationId! }

  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!campeonato || !campeonato.organizer) {
    return null
  }

  return {
    id: campeonato.id,
    nome: campeonato.name,
    descricao: campeonato.description,
    dataInicio: campeonato.startDate,
    dataFim: campeonato.endDate,
    local: campeonato.location,
    organizador: {
      id: campeonato.organizer.id,
      nome: campeonato.organizer.name,
    },
    createdAt: campeonato.createdAt,
  }
}

