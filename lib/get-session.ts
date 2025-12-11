import "server-only"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const SESSION_COOKIE_NAME = "session_token"

export type UserSession = {
  id: string
  email: string
  name: string | null
  role?: "GERENTE" | "ATLETA"
  teamName?: string
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
        user: true,
      },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    // Por enquanto, vamos usar dados mockados para role e teamName
    // Isso pode ser expandido depois com migrations do Prisma
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: "GERENTE" as const, // TODO: Adicionar campo role no schema
      teamName: "Minha Equipe", // TODO: Adicionar relação com Team no schema
    }
  } catch (error) {
    console.error("[GET_SESSION]", error)
    return null
  }
}

