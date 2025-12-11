import "server-only"
import { prisma } from "@/lib/prisma"

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

export async function getAtletas(): Promise<AtletaDTO[]> {
  const atletas = await prisma.athlete.findMany({
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

export async function getAtletaById(id: string): Promise<AtletaDTO | null> {
  const atleta = await prisma.athlete.findUnique({
    where: { id },
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

