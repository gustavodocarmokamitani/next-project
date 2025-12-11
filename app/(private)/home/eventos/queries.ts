import "server-only"
import { prisma } from "@/lib/prisma"

export type EventoDTO = {
  id: string
  name: string
  date: Date
  location: string | null
  type: string
  description: string | null
  categorias: { id: string; name: string }[]
}

export async function getEventos(): Promise<EventoDTO[]> {
  const eventos = await prisma.event.findMany({
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

export async function getEventoById(id: string): Promise<EventoDTO | null> {
  const evento = await prisma.event.findUnique({
    where: { id },
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

