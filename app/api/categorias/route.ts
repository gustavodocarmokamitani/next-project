import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categorias = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("[CATEGORIAS_API]", error)
    return NextResponse.json(
      { error: "Erro ao buscar categorias." },
      { status: 500 },
    )
  }
}

