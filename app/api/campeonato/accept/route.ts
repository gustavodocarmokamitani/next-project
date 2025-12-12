import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.organizationId || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Você precisa estar logado como administrador de uma organização" },
        { status: 401 },
      )
    }

    const { token } = await req.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 },
      )
    }

    // Busca o convite público (organizationId null) com este token
    const convite = await (prisma as any).championshipInvite.findFirst({
      where: {
        token,
        organizationId: null, // Apenas convites públicos
        expiresAt: {
          gt: new Date(), // Ainda não expirou
        },
      },
      include: {
        championship: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!convite) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 },
      )
    }

    // Se o convite é público (organizationId null), qualquer organização pode aceitar
    // Se o convite é específico, verifica se pertence à organização
    if (convite.organizationId && convite.organizationId !== session.organizationId) {
      return NextResponse.json(
        { error: "Este convite não pertence à sua organização" },
        { status: 403 },
      )
    }

    // Verifica se a organização já aceitou este convite (para convites públicos)
    if (!convite.organizationId) {
      const aceiteExistente = await (prisma as any).championshipInvite.findFirst({
        where: {
          championshipId: convite.championshipId,
          organizationId: session.organizationId,
          token: token, // Mesmo token, mas com organizationId preenchido
        },
      })

      if (aceiteExistente) {
        return NextResponse.json(
          { error: "Sua organização já aceitou este convite" },
          { status: 400 },
        )
      }
    } else {
      // Para convites específicos, verifica se já foi usado
      if (convite.used) {
        return NextResponse.json(
          { error: "Este convite já foi utilizado" },
          { status: 400 },
        )
      }
    }

    if (new Date(convite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Este convite expirou" },
        { status: 400 },
      )
    }

    // Para convites públicos, cria um novo registro com organizationId
    // Para convites específicos, marca como usado
    if (!convite.organizationId) {
      // Convite público - cria um novo registro para esta organização
      await (prisma as any).championshipInvite.create({
        data: {
          championshipId: convite.championshipId,
          organizationId: session.organizationId,
          token: token, // Mantém o mesmo token
          expiresAt: convite.expiresAt,
          used: true,
          usedAt: new Date(),
        },
      })
    } else {
      // Convite específico - marca como usado
      await (prisma as any).championshipInvite.update({
        where: { id: convite.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Convite aceito com sucesso!",
      championship: {
        id: convite.championshipId,
        name: convite.championship.name,
      },
    })
  } catch (error) {
    console.error("Erro ao aceitar convite:", error)
    return NextResponse.json(
      { error: "Erro ao aceitar convite" },
      { status: 500 },
    )
  }
}

