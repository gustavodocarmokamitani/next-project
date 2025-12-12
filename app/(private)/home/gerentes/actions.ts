"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"

export async function createGerente(formData: FormData) {
  const session = await getSession()
  
  if (!session || !session.organizationId || session.role !== "ADMIN") {
    redirect("/login")
  }
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")
  const password = formData.get("password")
  const categorias = formData.getAll("categorias")

  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    redirect("/home/gerentes/adicionar?error=Nome é obrigatório.")
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect("/home/gerentes/adicionar?error=Sobrenome é obrigatório.")
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect("/home/gerentes/adicionar?error=Telefone é obrigatório.")
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    redirect("/home/gerentes/adicionar?error=Senha deve ter no mínimo 6 caracteres.")
  }

  if (categorias.length === 0) {
    redirect("/home/gerentes/adicionar?error=Selecione pelo menos uma categoria.")
  }

  // Verifica se já existe um usuário/gerente com este telefone
  const existingUser = await prisma.user.findUnique({ where: { phone: phone.trim() } })
  const existingManager = await prisma.manager.findUnique({ where: { phone: phone.trim() } })

  if (existingUser || existingManager) {
    redirect("/home/gerentes/adicionar?error=Já existe um usuário ou gerente com este telefone.")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  // Cria o usuário
  const user = await prisma.user.create({
    data: {
      phone: phone.trim(),
      password: passwordHash,
      name: `${firstName.trim()} ${lastName.trim()}`,
    },
  })

  // Verifica se as categorias pertencem à organização
  const categoriasValidas = await prisma.category.findMany({
    where: {
      id: { in: categorias as string[] },
      organizationId: session.organizationId,
    },
  })

  if (categoriasValidas.length !== categorias.length) {
    redirect("/home/gerentes/adicionar?error=Uma ou mais categorias não pertencem à sua organização.")
  }

  // Cria o gerente
  await prisma.manager.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      userId: user.id,
      organizationId: session.organizationId,
      categories: {
        create: categorias.map((catId) => ({
          categoryId: catId as string,
        })),
      },
    },
  })

  revalidatePath("/home/gerentes")
  redirect("/home/gerentes?success=Gerente cadastrado com sucesso!")
}

export async function updateGerente(formData: FormData) {
  const id = formData.get("id")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")
  const categorias = formData.getAll("categorias")

  if (!id || typeof id !== "string") {
    redirect("/home/gerentes?error=ID inválido.")
  }

  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    redirect(`/home/gerentes/editar/${id}?error=Nome é obrigatório.`)
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect(`/home/gerentes/editar/${id}?error=Sobrenome é obrigatório.`)
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect(`/home/gerentes/editar/${id}?error=Telefone é obrigatório.`)
  }

  if (categorias.length === 0) {
    redirect(`/home/gerentes/editar/${id}?error=Selecione pelo menos uma categoria.`)
  }

  // Remove todas as categorias antigas e cria as novas
  await prisma.manager.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      categories: {
        deleteMany: {},
        create: categorias.map((catId) => ({
          categoryId: catId as string,
        })),
      },
    },
  })

  revalidatePath("/home/gerentes")
  redirect("/home/gerentes?success=Gerente atualizado com sucesso!")
}

export async function deleteGerente(id: string) {
  if (!id || typeof id !== "string") {
    redirect("/home/gerentes?error=ID inválido.")
  }

  await prisma.manager.delete({
    where: { id },
  })

  revalidatePath("/home/gerentes")
  redirect("/home/gerentes?success=Gerente deletado com sucesso!")
}

export async function generateInviteLink(formData: FormData) {
  const categorias = formData.getAll("categorias")

  if (categorias.length === 0) {
    redirect("/home/gerentes/adicionar?error=Selecione pelo menos uma categoria.&tab=convite")
  }

  const token = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

  // Salva as categorias no token (pode ser melhorado com uma tabela separada)
  await prisma.managerInvite.create({
    data: {
      token,
      expiresAt,
      // Por enquanto, vamos salvar as categorias em uma string separada por vírgula
      // ou criar uma tabela ManagerInviteCategory
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const link = `${baseUrl}/gerente/convite/${token}?categorias=${categorias.join(",")}`
  
  redirect(`/home/gerentes/adicionar?link=${encodeURIComponent(link)}&tab=convite`)
}

