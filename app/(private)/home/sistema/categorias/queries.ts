import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CategoriaGlobalDTO = {
  id: string
  nome: string
  createdAt: Date
}

export async function getCategoriasGlobais(): Promise<CategoriaGlobalDTO[]> {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    return []
  }

  const categorias = await prisma.category.findMany({
    where: {
      organizationId: null, // Apenas categorias globais
    },
    select: { 
      id: true, 
      name: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  })

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
    createdAt: categoria.createdAt,
  }))
}

export async function getCategoriaGlobalById(id: string): Promise<CategoriaGlobalDTO | null> {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    return null
  }

  const categoria = await prisma.category.findFirst({
    where: {
      id,
      organizationId: null, // Deve ser global
    },
    select: { 
      id: true, 
      name: true,
      createdAt: true,
    },
  })

  if (!categoria) {
    return null
  }

  return {
    id: categoria.id,
    nome: categoria.name,
    createdAt: categoria.createdAt,
  }
}

