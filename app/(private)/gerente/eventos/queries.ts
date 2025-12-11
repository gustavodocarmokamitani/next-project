import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type EventoDTO = {
  id: string
  name: string
  date: Date
  location: string | null
  type: string
  description: string | null
  categorias: { id: string; name: string }[]
}

export async function getEventosDoGerente(): Promise<EventoDTO[]> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return []
  }

  const eventos = await prisma.event.findMany({
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
      date: "asc",
    },
  })

  return eventos.map((evento) => ({
    id: evento.id,
    name: evento.name,
    date: evento.date,
    location: evento.location,
    type: evento.type,
    description: evento.description,
    categorias: evento.categories.map((ec) => ({
      id: ec.category.id,
      name: ec.category.name,
    })),
  }))
}

export async function getEventoByIdDoGerente(id: string): Promise<EventoDTO | null> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return null
  }

  const evento = await prisma.event.findFirst({
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

  if (!evento) {
    return null
  }

  return {
    id: evento.id,
    name: evento.name,
    date: evento.date,
    location: evento.location,
    type: evento.type,
    description: evento.description,
    categorias: evento.categories.map((ec) => ({
      id: ec.category.id,
      name: ec.category.name,
    })),
  }
}

