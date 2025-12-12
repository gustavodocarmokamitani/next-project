import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type DespesaCampeonatoDTO = {
  id: string
  nome: string
  valor: number
  quantityEnabled: boolean
  isFixed: boolean
  required: boolean
}

export async function getDespesasCampeonato(
  campeonatoId: string,
): Promise<DespesaCampeonatoDTO[]> {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
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

  // Busca o Payment do campeonato
  const payment = await prisma.payment.findFirst({
    where: {
      championshipId: campeonatoId,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!payment) {
    return []
  }

  return payment.items.map((item) => ({
    id: item.id,
    nome: item.name,
    valor: item.value,
    quantityEnabled: item.quantityEnabled,
    isFixed: item.isFixed,
    required: item.required,
  }))
}

