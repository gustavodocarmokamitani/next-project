import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CampeonatoCategoriaDTO = {
  id: string
  nome: string
  categoriaGlobalId: string | null
  categoriaGlobalNome: string | null
  allowUpgrade: boolean
  createdAt: Date
}

export async function getCampeonatoCategorias(
  campeonatoId: string,
): Promise<CampeonatoCategoriaDTO[]> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return []
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    return []
  }

  // Verifica se o campeonato pertence à organização (SYSTEM pode ver qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { id: campeonatoId }
    : { id: campeonatoId, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    return []
  }

  const categorias = await (prisma as any).championshipCategory.findMany({
    where: {
      championshipId: campeonatoId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
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
    categoriaGlobalId: cat.categoryId,
    categoriaGlobalNome: cat.category?.name || null,
    allowUpgrade: cat.allowUpgrade,
    createdAt: cat.createdAt,
  }))
}

export async function getCampeonatoCategoriaById(
  campeonatoId: string,
  categoriaId: string,
): Promise<CampeonatoCategoriaDTO | null> {
  const session = await getSession()

  if (!session || !session.organizationId || session.role !== "ADMIN") {
    return null
  }

  // Verifica se o campeonato pertence à organização
  const campeonato = await (prisma as any).championship.findFirst({
    where: {
      id: campeonatoId,
      organizerId: session.organizationId,
    },
    select: { id: true },
  })

  if (!campeonato) {
    return null
  }

  const categoria = await (prisma as any).championshipCategory.findFirst({
    where: {
      id: categoriaId,
      championshipId: campeonatoId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!categoria) {
    return null
  }

  return {
    id: categoria.id,
    nome: categoria.name,
    categoriaGlobalId: categoria.categoryId,
    categoriaGlobalNome: categoria.category?.name || null,
    allowUpgrade: categoria.allowUpgrade,
    createdAt: categoria.createdAt,
  }
}

