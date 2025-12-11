import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type AtletaDTO = {
  id: string
  firstName: string
  lastName: string
  phone: string
  federationId: string | null
  confederationId: string | null
  birthDate: Date
  shirtNumber: string | null
  categorias: { id: string; name: string }[]
}

export async function getAtletasDoGerente(): Promise<AtletaDTO[]> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return []
  }

  const atletas = await prisma.athlete.findMany({
    where: {
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
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
    federationId: atleta.federationId,
    confederationId: atleta.confederationId,
    birthDate: atleta.birthDate,
    shirtNumber: atleta.shirtNumber,
    categorias: atleta.categories.map((ac) => ({
      id: ac.category.id,
      name: ac.category.name,
    })),
  }))
}

export async function getAtletaByIdDoGerente(id: string): Promise<AtletaDTO | null> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return null
  }

  const atleta = await prisma.athlete.findFirst({
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
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  })

  if (!atleta) {
    return null
  }

  return {
    id: atleta.id,
    firstName: atleta.firstName,
    lastName: atleta.lastName,
    phone: atleta.phone,
    federationId: atleta.federationId,
    confederationId: atleta.confederationId,
    birthDate: atleta.birthDate,
    shirtNumber: atleta.shirtNumber,
    categorias: atleta.categories.map((ac) => ({
      id: ac.category.id,
      name: ac.category.name,
    })),
  }
}

