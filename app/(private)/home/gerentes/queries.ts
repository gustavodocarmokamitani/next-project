import "server-only"
import { prisma } from "@/lib/prisma"

export type GerenteDTO = {
  id: string
  firstName: string
  lastName: string
  phone: string
  categorias: { id: string; name: string }[]
}

export async function getGerentes(): Promise<GerenteDTO[]> {
  const gerentes = await prisma.manager.findMany({
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

  return gerentes.map((gerente) => ({
    id: gerente.id,
    firstName: gerente.firstName,
    lastName: gerente.lastName,
    phone: gerente.phone,
    categorias: gerente.categories.map((mc) => ({
      id: mc.category.id,
      name: mc.category.name,
    })),
  }))
}

export async function getGerenteById(id: string): Promise<GerenteDTO | null> {
  const gerente = await prisma.manager.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  })

  if (!gerente) {
    return null
  }

  return {
    id: gerente.id,
    firstName: gerente.firstName,
    lastName: gerente.lastName,
    phone: gerente.phone,
    categorias: gerente.categories.map((mc) => ({
      id: mc.category.id,
      name: mc.category.name,
    })),
  }
}

