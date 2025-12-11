import "server-only"
import { prisma } from "@/lib/prisma"

export type CategoriaDTO = {
  id: string
  nome: string
}

export async function getCategoriaById(id: string): Promise<CategoriaDTO | null> {
  const categoria = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true },
  })

  if (!categoria) {
    return null
  }

  return { id: categoria.id, nome: categoria.name }
}

export async function getCategorias(): Promise<CategoriaDTO[]> {
  const categorias = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
  }))
}

