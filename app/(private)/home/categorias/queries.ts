import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type CategoriaDTO = {
  id: string
  nome: string
  isGlobal?: boolean // true se for categoria global (organizationId: null)
  organizationId?: string | null
}

export async function getCategoriaById(id: string): Promise<CategoriaDTO | null> {
  const session = await getSession()
  
  if (!session) {
    return null
  }

  // Se for ADMIN, precisa ter organizationId
  if (session.role === "ADMIN" && !session.organizationId) {
    return null
  }

  // Busca a categoria
  const categoria = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true, organizationId: true },
  })

  if (!categoria) {
    return null
  }

  // SYSTEM pode ver todas
  if (session.role === "SYSTEM") {
    return { 
      id: categoria.id, 
      nome: categoria.name,
      isGlobal: categoria.organizationId === null,
      organizationId: categoria.organizationId,
    }
  }

  // ADMIN pode ver globais (null) ou da sua organização
  if (categoria.organizationId === null || categoria.organizationId === session.organizationId) {
    return { 
      id: categoria.id, 
      nome: categoria.name,
      isGlobal: categoria.organizationId === null,
      organizationId: categoria.organizationId,
    }
  }

  return null
}

export async function getCategorias(): Promise<CategoriaDTO[]> {
  const session = await getSession()
  
  if (!session) {
    return []
  }

  // Se for ADMIN, precisa ter organizationId
  if (session.role === "ADMIN" && !session.organizationId) {
    return []
  }

  if (session.role === "SYSTEM") {
    // SYSTEM vê todas as categorias (globais + todas organizacionais)
    const categorias = await prisma.category.findMany({
      select: { id: true, name: true, organizationId: true },
      orderBy: { name: "asc" },
    })

    return categorias.map((categoria) => ({
      id: categoria.id,
      nome: categoria.name,
    }))
  } else {
    // ADMIN vê categorias globais + categorias da sua organização
    const categorias = await prisma.category.findMany({
      where: {
        OR: [
          { organizationId: null }, // Categorias globais
          { organizationId: session.organizationId! }, // Categorias da organização
        ],
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
}

/**
 * Retorna apenas categorias globais (organizationId: null)
 * Apenas SYSTEM pode usar
 */
export async function getCategoriasGlobais(): Promise<CategoriaDTO[]> {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    return []
  }

  const categorias = await prisma.category.findMany({
    where: {
      organizationId: null,
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
  }))
}

/**
 * Retorna categorias da organização do usuário
 * ADMIN pode usar
 */
export async function getCategoriasOrganizacao(): Promise<CategoriaDTO[]> {
  const session = await getSession()
  
  if (!session || session.role !== "ADMIN" || !session.organizationId) {
    return []
  }

  const categorias = await prisma.category.findMany({
    where: {
      organizationId: session.organizationId,
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
  }))
}

/**
 * Retorna apenas categorias globais (organizationId: null)
 * ADMIN pode usar para selecionar e adicionar à sua organização
 */
export async function getCategoriasGlobaisParaAdmin(): Promise<CategoriaDTO[]> {
  const session = await getSession()
  
  if (!session || session.role !== "ADMIN") {
    return []
  }

  const categorias = await prisma.category.findMany({
    where: {
      organizationId: null, // Apenas categorias globais
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name,
  }))
}

