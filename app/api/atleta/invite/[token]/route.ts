import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params

    const invite = await prisma.athleteInvite.findUnique({
      where: { token },
    })

    if (!invite) {
      return NextResponse.json(
        { error: "Link de convite inválido." },
        { status: 404 },
      )
    }

    if (invite.used) {
      return NextResponse.json(
        { error: "Este link de convite já foi utilizado." },
        { status: 400 },
      )
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Este link de convite expirou." },
        { status: 400 },
      )
    }

    return NextResponse.json({ valid: true, expiresAt: invite.expiresAt })
  } catch (error) {
    console.error("[ATLETA_INVITE_CHECK]", error)
    return NextResponse.json(
      { error: "Erro ao verificar convite." },
      { status: 500 },
    )
  }
}

