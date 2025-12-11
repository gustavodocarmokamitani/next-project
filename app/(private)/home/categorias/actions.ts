"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createCategoria(formData: FormData) {
  const nome = formData.get("nome")

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect("/home/categorias/adicionar?error=Nome é obrigatório.")
  }

  await prisma.category.create({
    data: { name: nome.trim() },
  })

  revalidatePath("/home/categorias")
  redirect("/home/categorias?success=Categoria adicionada com sucesso!")
}

export async function updateCategoria(formData: FormData) {
  const id = formData.get("id")
  const nome = formData.get("nome")

  if (!id || typeof id !== "string") {
    redirect("/home/categorias?error=ID inválido.")
  }

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect(`/home/categorias/editar/${id}?error=Nome é obrigatório.`)
  }

  await prisma.category.update({
    where: { id },
    data: { name: nome.trim() },
  })

  revalidatePath("/home/categorias")
  redirect("/home/categorias?success=Categoria atualizada com sucesso!")
}

export async function deleteCategoria(id: string) {
  if (!id || typeof id !== "string") {
    redirect("/home/categorias?error=ID inválido.")
  }

  await prisma.category.delete({
    where: { id },
  })

  revalidatePath("/home/categorias")
  redirect("/home/categorias?success=Categoria deletada com sucesso!")
}

