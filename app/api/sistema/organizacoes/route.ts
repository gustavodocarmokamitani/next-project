import { NextResponse } from "next/server"
import { getSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return NextResponse.json(organizations)
}

