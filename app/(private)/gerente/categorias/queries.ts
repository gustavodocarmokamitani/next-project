import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CategoriaDTO = {
  id: string
  nome: string
  isGlobal?: boolean // true se for categoria global (organizationId: null)
  organizationId?: string | null
}

export async function getCategoriasDoGerente(): Promise<CategoriaDTO[]> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds) {
    return []
  }

  const categorias = await prisma.category.findMany({
    where: {
      id: {
        in: session.categoryIds,
      },
      managers: {
        some: {
          managerId: session.managerId,
        },
      },
    },
    select: { id: true, name: true, organizationId: true },
    orderBy: { name: "asc" },
  })

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
    isGlobal: categoria.organizationId === null,
    organizationId: categoria.organizationId,
  }))
}

