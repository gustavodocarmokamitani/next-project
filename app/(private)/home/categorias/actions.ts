"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function createCategoria(formData: FormData) {
  const session = await getSession()
  
  if (!session || !session.organizationId || session.role !== "ADMIN") {
    redirect("/login")
  }

  const nome = formData.get("nome")

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect("/home/categorias/adicionar?error=Nome é obrigatório.")
  }

  await prisma.category.create({
    data: { 
      name: nome.trim(),
      organizationId: session.organizationId,
    },
  })

  revalidatePath("/home/categorias")
  redirect("/home/categorias?success=Categoria adicionada com sucesso!")
}

export async function updateCategoria(formData: FormData) {
  const session = await getSession()
  
  if (!session || !session.organizationId || session.role !== "ADMIN") {
    redirect("/login")
  }

  const id = formData.get("id")
  const nome = formData.get("nome")

  if (!id || typeof id !== "string") {
    redirect("/home/categorias?error=ID inválido.")
  }

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect(`/home/categorias/editar/${id}?error=Nome é obrigatório.`)
  }

  // Verifica se a categoria pertence à organização
  const categoria = await prisma.category.findUnique({
    where: { id },
    select: { organizationId: true },
  })

  if (!categoria || categoria.organizationId !== session.organizationId) {
    redirect("/home/categorias?error=Categoria não encontrada.")
  }

  await prisma.category.update({
    where: { id },
    data: { name: nome.trim() },
  })

  revalidatePath("/home/categorias")
  redirect("/home/categorias?success=Categoria atualizada com sucesso!")
}

export async function deleteCategoria(id: string) {
  const session = await getSession()
  
  if (!session || !session.organizationId || session.role !== "ADMIN") {
    redirect("/login")
  }

  if (!id || typeof id !== "string") {
    redirect("/home/categorias?error=ID inválido.")
  }

  // Verifica se a categoria pertence à organização
  const categoria = await prisma.category.findFirst({
    where: { 
      id,
      organizationId: session.organizationId,
    },
    select: { id: true },
  })

  if (!categoria) {
    redirect("/home/categorias?error=Categoria não encontrada.")
  }

  await prisma.category.delete({
    where: { id },
  })

  revalidatePath("/home/categorias")
  redirect("/home/categorias?success=Categoria deletada com sucesso!")
}

