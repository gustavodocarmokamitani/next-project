import "server-only"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const SESSION_COOKIE_NAME = "session_token"

export type UserSession = {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  organizationName: string | null
  organizationId: string | null
  role: "SYSTEM" | "ADMIN" | "GERENTE" | "ATLETA"
  managerId?: string
  athleteId?: string
  categoryIds?: string[]
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            organization: true,
            manager: {
              include: {
                organization: true,
                categories: true,
              },
            },
            athlete: {
              include: {
                organization: true,
                categories: true,
              },
            },
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    const { user } = session

    // Determina o tipo de usuário e categorias
    let role: "SYSTEM" | "ADMIN" | "GERENTE" | "ATLETA" = "ADMIN"
    let managerId: string | undefined
    let athleteId: string | undefined
    let categoryIds: string[] = []

    // Verifica se é SYSTEM admin primeiro
    if (user.role === "SYSTEM") {
      role = "SYSTEM"
    } else if (user.manager) {
      role = "GERENTE"
      managerId = user.manager.id
      categoryIds = user.manager.categories.map((mc) => mc.categoryId)
    } else if (user.athlete) {
      role = "ATLETA"
      athleteId = user.athlete.id
      categoryIds = user.athlete.categories.map((ac) => ac.categoryId)
    }

    // Determina organizationId baseado no tipo de usuário
    let organizationId: string | null = user.organizationId

    if (user.manager && !user.role) {
      // Se manager tem organization, usa ela
      if (user.manager.organization) {
        organizationId = user.manager.organizationId
      }
    } else if (user.athlete && !user.role) {
      // Se athlete tem organization, usa ela
      if (user.athlete.organization) {
        organizationId = user.athlete.organizationId
      }
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      organizationName: user.organizationName,
      organizationId,
      role,
      managerId,
      athleteId,
      categoryIds,
    }
  } catch (error) {
    console.error("[GET_SESSION]", error)
    return null
  }
}

