import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CategoriaDTO = {
  id: string
  nome: string
}

export async function getCategoriaById(id: string): Promise<CategoriaDTO | null> {
  const session = await getSession()
  
  if (!session) {
    return null
  }

  // SYSTEM pode ver todas, ADMIN apenas da sua organização
  const whereClause = session.role === "SYSTEM"
    ? { id }
    : { id, organizationId: session.organizationId }

  const categoria = await prisma.category.findFirst({
    where: whereClause,
    select: { id: true, name: true },
  })

  if (!categoria) {
    return null
  }

  return { id: categoria.id, nome: categoria.name }
}

export async function getCategorias(): Promise<CategoriaDTO[]> {
  const session = await getSession()
  
  if (!session) {
    return []
  }

  // SYSTEM vê todas as categorias, ADMIN apenas da sua organização
  const whereClause = session.role === "SYSTEM"
    ? {}
    : { organizationId: session.organizationId }

  const categorias = await prisma.category.findMany({
    where: whereClause,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
  }))
}

