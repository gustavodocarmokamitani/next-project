import "server-only"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const SESSION_COOKIE_NAME = "session_token"

export type UserSession = {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  teamName: string | null
  role: "ADMIN" | "GERENTE" | "ATLETA"
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
            manager: {
              include: {
                categories: true,
              },
            },
            athlete: {
              include: {
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
    let role: "ADMIN" | "GERENTE" | "ATLETA" = "ADMIN"
    let managerId: string | undefined
    let athleteId: string | undefined
    let categoryIds: string[] = []

    if (user.manager) {
      role = "GERENTE"
      managerId = user.manager.id
      categoryIds = user.manager.categories.map((mc) => mc.categoryId)
    } else if (user.athlete) {
      role = "ATLETA"
      athleteId = user.athlete.id
      categoryIds = user.athlete.categories.map((ac) => ac.categoryId)
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      teamName: user.teamName,
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

