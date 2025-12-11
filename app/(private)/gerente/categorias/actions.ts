"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function removerCategoria(categoryId: string) {
  const session = await getSession()

  if (!session || !session.managerId || session.role !== "GERENTE") {
    redirect("/login")
  }

  if (!categoryId || typeof categoryId !== "string") {
    redirect("/gerente/categorias?error=ID inválido.")
  }

  // Verifica se o gerente realmente faz parte desta categoria
  const managerCategory = await prisma.managerCategory.findUnique({
    where: {
      managerId_categoryId: {
        managerId: session.managerId,
        categoryId,
      },
    },
  })

  if (!managerCategory) {
    redirect("/gerente/categorias?error=Você não faz parte desta categoria.")
  }

  // Remove a relação entre gerente e categoria
  await prisma.managerCategory.delete({
    where: {
      managerId_categoryId: {
        managerId: session.managerId,
        categoryId,
      },
    },
  })

  revalidatePath("/gerente/categorias")
  redirect("/gerente/categorias?success=Categoria removida com sucesso!")
}

