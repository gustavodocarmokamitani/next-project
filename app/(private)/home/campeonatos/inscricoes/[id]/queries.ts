import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type AtletaInscricaoDTO = {
  id: string
  firstName: string
  lastName: string
  phone: string
  categorias: {
    id: string
    name: string
  }[]
}

export type CategoriaInscricaoDTO = {
  id: string
  nome: string
  allowUpgrade: boolean
  atletasInscritos: {
    id: string
    firstName: string
    lastName: string
    confirmed: boolean
  }[]
}

export async function getAtletasParaInscricao(): Promise<AtletaInscricaoDTO[]> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return []
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    return []
  }

  // SYSTEM vê todos os atletas, ADMIN apenas da sua organização
  const whereClause = session.role === "SYSTEM"
    ? {}
    : { organizationId: session.organizationId! }
  
  const atletas = await prisma.athlete.findMany({
    where: whereClause,
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      firstName: "asc",
    },
  })

  return atletas.map((atleta) => ({
    id: atleta.id,
    firstName: atleta.firstName,
    lastName: atleta.lastName,
    phone: atleta.phone,
    categorias: atleta.categories.map((ac) => ({
      id: ac.category.id,
      name: ac.category.name,
    })),
  }))
}

export async function getCategoriasComInscricoes(
  campeonatoId: string,
): Promise<CategoriaInscricaoDTO[]> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return []
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    return []
  }

  // Verifica se a organização aceitou o convite (SYSTEM pode ver qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { championshipId: campeonatoId, used: true }
    : { championshipId: campeonatoId, organizationId: session.organizationId!, used: true }
  
  const convite = await (prisma as any).championshipInvite.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!convite && session.role !== "SYSTEM") {
    return []
  }

  // Busca categorias do campeonato
  // SYSTEM vê todas as entries, ADMIN apenas da sua organização
  const entriesWhereClause = session.role === "SYSTEM"
    ? {}
    : { organizationId: session.organizationId! }
  
  const categorias = await (prisma as any).championshipCategory.findMany({
    where: {
      championshipId: campeonatoId,
    },
    include: {
      entries: {
        where: entriesWhereClause,
        include: {
          athleteEntries: {
            include: {
              athlete: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return categorias.map((cat: any) => ({
    id: cat.id,
    nome: cat.name,
    allowUpgrade: cat.allowUpgrade,
    atletasInscritos: cat.entries.flatMap((entry: any) =>
      entry.athleteEntries.map((ae: any) => ({
        id: ae.athlete.id,
        firstName: ae.athlete.firstName,
        lastName: ae.athlete.lastName,
        confirmed: ae.confirmed,
      })),
    ),
  }))
}

