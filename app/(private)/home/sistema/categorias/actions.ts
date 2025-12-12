"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function createCategoriaGlobal(formData: FormData) {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  const nome = formData.get("nome")

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect("/home/sistema/categorias/adicionar?error=Nome é obrigatório.")
  }

  // Verifica se já existe categoria global com esse nome
  const categoriaExistente = await prisma.category.findFirst({
    where: {
      name: nome.trim(),
      organizationId: null,
    },
  })

  if (categoriaExistente) {
    redirect("/home/sistema/categorias/adicionar?error=Já existe uma categoria global com esse nome.")
  }

  await prisma.category.create({
    data: { 
      name: nome.trim(),
      organizationId: null, // Categoria global
    },
  })

  revalidatePath("/home/sistema/categorias")
  redirect("/home/sistema/categorias?success=Categoria global adicionada com sucesso!")
}

export async function updateCategoriaGlobal(formData: FormData) {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  const id = formData.get("id")
  const nome = formData.get("nome")

  if (!id || typeof id !== "string") {
    redirect("/home/sistema/categorias?error=ID inválido.")
  }

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect(`/home/sistema/categorias/editar/${id}?error=Nome é obrigatório.`)
  }

  // Verifica se a categoria é global
  const categoria = await prisma.category.findFirst({
    where: { 
      id,
      organizationId: null, // Deve ser global
    },
    select: { id: true },
  })

  if (!categoria) {
    redirect("/home/sistema/categorias?error=Categoria não encontrada.")
  }

  // Verifica se já existe outra categoria global com esse nome
  const categoriaExistente = await prisma.category.findFirst({
    where: {
      name: nome.trim(),
      organizationId: null,
      NOT: { id },
    },
  })

  if (categoriaExistente) {
    redirect(`/home/sistema/categorias/editar/${id}?error=Já existe uma categoria global com esse nome.`)
  }

  await prisma.category.update({
    where: { id },
    data: { name: nome.trim() },
  })

  revalidatePath("/home/sistema/categorias")
  redirect("/home/sistema/categorias?success=Categoria global atualizada com sucesso!")
}

export async function deleteCategoriaGlobal(id: string) {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  if (!id || typeof id !== "string") {
    redirect("/home/sistema/categorias?error=ID inválido.")
  }

  // Verifica se a categoria é global
  const categoria = await prisma.category.findFirst({
    where: { 
      id,
      organizationId: null, // Deve ser global
    },
    select: { id: true },
  })

  if (!categoria) {
    redirect("/home/sistema/categorias?error=Categoria não encontrada.")
  }

  await prisma.category.delete({
    where: { id },
  })

  revalidatePath("/home/sistema/categorias")
  redirect("/home/sistema/categorias?success=Categoria global deletada com sucesso!")
}

