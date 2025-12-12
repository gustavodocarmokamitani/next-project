"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function createCategoria(formData: FormData) {
  const session = await getSession()
  
  if (!session) {
    redirect("/login?error=Sessão expirada. Faça login novamente.")
  }

  if (session.role !== "ADMIN") {
    redirect("/login?error=Acesso negado. Apenas administradores podem adicionar categorias.")
  }

  if (!session.organizationId) {
    redirect("/home/categorias/adicionar?error=Você precisa estar associado a uma organização para adicionar categorias.")
  }

  const nome = formData.get("nome")
  const isCustom = formData.get("isCustom") === "true"

  // Apenas cria categorias custom
  if (isCustom && nome && typeof nome === "string" && nome.trim().length > 0) {
    // Verifica se já existe uma categoria com o mesmo nome na organização
    const categoriaExistente = await prisma.category.findFirst({
      where: {
        name: nome.trim(),
        organizationId: session.organizationId,
      },
    })

    if (categoriaExistente) {
      redirect("/home/categorias/adicionar?error=Já existe uma categoria com este nome na sua organização.")
    }

    await prisma.category.create({
      data: {
        name: nome.trim(),
        organizationId: session.organizationId,
      },
    })

    revalidatePath("/home/categorias")
    redirect("/home/categorias?success=Categoria custom adicionada com sucesso!")
  }

  // Se nenhuma opção foi selecionada
  redirect("/home/categorias/adicionar?error=Preencha o nome da categoria custom.")
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

  if (!categoria) {
    redirect("/home/categorias?error=Categoria não encontrada.")
  }

  // Não permite editar categorias globais (apenas SYSTEM pode)
  if (categoria.organizationId === null) {
    redirect("/home/categorias?error=Não é possível editar categorias globais. Apenas o administrador do sistema pode editá-las.")
  }

  // Verifica se a categoria pertence à organização do usuário
  if (categoria.organizationId !== session.organizationId) {
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

  // Verifica se a categoria existe e pertence à organização
  const categoria = await prisma.category.findUnique({
    where: { id },
    select: { id: true, organizationId: true },
  })

  if (!categoria) {
    redirect("/home/categorias?error=Categoria não encontrada.")
  }

  // Não permite deletar categorias globais (apenas SYSTEM pode)
  if (categoria.organizationId === null) {
    redirect("/home/categorias?error=Não é possível deletar categorias globais. Apenas o administrador do sistema pode deletá-las.")
  }

  // Verifica se a categoria pertence à organização do usuário
  if (categoria.organizationId !== session.organizationId) {
    redirect("/home/categorias?error=Categoria não encontrada.")
  }

  await prisma.category.delete({
    where: { id },
  })

  revalidatePath("/home/categorias")
  redirect("/home/categorias?success=Categoria deletada com sucesso!")
}

