import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export type DespesaDTO = {
  id: string
  name: string
  dueDate: Date
  isFinalized: boolean
  categories: { id: string; name: string }[]
  event: { id: string; name: string } | null
  items: { id: string; name: string; value: number; quantityEnabled: boolean; required: boolean }[]
}

export async function getDespesasDoGerente(): Promise<DespesaDTO[]> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return []
  }

  const payments = await prisma.payment.findMany({
    where: {
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      event: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  })

  return payments.map((payment) => ({
    id: payment.id,
    name: payment.name,
    dueDate: payment.dueDate,
    isFinalized: payment.isFinalized,
    categories: payment.categories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
    })),
    event: payment.event
      ? {
          id: payment.event.id,
          name: payment.event.name,
        }
      : null,
    items: payment.items.map((item) => ({
      id: item.id,
      name: item.name,
      value: item.value,
      quantityEnabled: item.quantityEnabled,
      required: item.required,
    })),
  }))
}

export async function getDespesaByIdDoGerente(id: string): Promise<DespesaDTO | null> {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.categoryIds.length === 0) {
    return null
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id,
      categories: {
        some: {
          categoryId: {
            in: session.categoryIds,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      event: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!payment) {
    return null
  }

  return {
    id: payment.id,
    name: payment.name,
    dueDate: payment.dueDate,
    isFinalized: payment.isFinalized,
    categories: payment.categories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
    })),
    event: payment.event
      ? {
          id: payment.event.id,
          name: payment.event.name,
        }
      : null,
    items: payment.items.map((item) => ({
      id: item.id,
      name: item.name,
      value: item.value,
      quantityEnabled: item.quantityEnabled,
      required: item.required,
    })),
  }
}

