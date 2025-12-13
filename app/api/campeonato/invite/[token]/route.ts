import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params

    // Busca PRIMEIRO o convite público (organizationId null)
    // Se não encontrar, busca um convite específico
    let convite = await (prisma as any).championshipInvite.findFirst({
      where: {
        token,
        organizationId: null, // Convite público
      },
      include: {
        championship: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Se não encontrou convite público, busca um convite específico
    if (!convite) {
      convite = await (prisma as any).championshipInvite.findFirst({
        where: {
          token,
          organizationId: { not: null },
        },
        include: {
          championship: {
            select: {
              id: true,
              name: true,
              description: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    if (!convite) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 },
      )
    }

    // Para convites públicos (organizationId null), NÃO verifica se está 'used'
    // pois múltiplas organizações podem aceitar o mesmo convite público
    // Para convites específicos, verifica se já foi usado
    if (convite.organizationId !== null && convite.used) {
      return NextResponse.json(
        { error: "Este convite já foi utilizado" },
        { status: 400 },
      )
    }

    if (new Date(convite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Este convite expirou" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      convite: {
        id: convite.id,
        championshipId: convite.championshipId,
        championshipName: convite.championship.name,
        championshipDescription: convite.championship.description,
        championshipStartDate: convite.championship.startDate,
        championshipEndDate: convite.championship.endDate,
        championshipLocation: convite.championship.location,
        organizationId: convite.organizationId,
        organizationName: convite.organization?.name,
        expiresAt: convite.expiresAt,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar convite:", error)
    return NextResponse.json(
      { error: "Erro ao buscar convite" },
      { status: 500 },
    )
  }
}

