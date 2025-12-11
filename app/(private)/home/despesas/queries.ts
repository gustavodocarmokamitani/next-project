import "server-only"
import { prisma } from "@/lib/prisma"

export type DespesaDTO = {
  id: string
  name: string
  dueDate: Date
  isFinalized: boolean
  categories: { id: string; name: string }[]
  event: { id: string; name: string } | null
  items: { id: string; name: string; value: number; quantityEnabled: boolean; required: boolean }[]
}

export async function getDespesas(): Promise<DespesaDTO[]> {
  const payments = await prisma.payment.findMany({
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

export async function getDespesaById(id: string): Promise<DespesaDTO | null> {
  const payment = await prisma.payment.findUnique({
    where: { id },
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

