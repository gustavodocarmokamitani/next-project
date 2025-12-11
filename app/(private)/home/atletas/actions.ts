"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"

export async function createAtleta(formData: FormData) {
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")
  const password = formData.get("password")
  const federationId = formData.get("federationId")
  const confederationId = formData.get("confederationId")
  const birthDate = formData.get("birthDate")
  const shirtNumber = formData.get("shirtNumber")
  const categorias = formData.getAll("categorias")

  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    redirect("/home/atletas/adicionar?error=Nome é obrigatório.")
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect("/home/atletas/adicionar?error=Sobrenome é obrigatório.")
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect("/home/atletas/adicionar?error=Telefone é obrigatório.")
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    redirect("/home/atletas/adicionar?error=Senha deve ter no mínimo 6 caracteres.")
  }

  if (!birthDate || typeof birthDate !== "string") {
    redirect("/home/atletas/adicionar?error=Data de nascimento é obrigatória.")
  }

  if (categorias.length === 0) {
    redirect("/home/atletas/adicionar?error=Selecione pelo menos uma categoria.")
  }

  // Verifica se já existe um usuário/atleta com este telefone
  const existingUser = await prisma.user.findUnique({ where: { phone: phone.trim() } })
  const existingAthlete = await prisma.athlete.findUnique({ where: { phone: phone.trim() } })

  if (existingUser || existingAthlete) {
    redirect("/home/atletas/adicionar?error=Já existe um usuário ou atleta com este telefone.")
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const birthDateObj = new Date(birthDate)

  // Cria o usuário
  const user = await prisma.user.create({
    data: {
      phone: phone.trim(),
      password: passwordHash,
      name: `${firstName.trim()} ${lastName.trim()}`,
    },
  })

  // Cria o atleta
  await prisma.athlete.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      federationId: federationId && typeof federationId === "string" ? federationId.trim() : null,
      confederationId:
        confederationId && typeof confederationId === "string" ? confederationId.trim() : null,
      birthDate: birthDateObj,
      shirtNumber: shirtNumber && typeof shirtNumber === "string" ? shirtNumber.trim() : null,
      userId: user.id,
      categories: {
        create: categorias.map((catId) => ({
          categoryId: catId as string,
        })),
      },
    },
  })

  revalidatePath("/home/atletas")
  redirect("/home/atletas?success=Atleta cadastrado com sucesso!")
}

export async function updateAtleta(formData: FormData) {
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "GERENTE")) {
    redirect("/login")
  }

  const id = formData.get("id")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")
  const federationId = formData.get("federationId")
  const confederationId = formData.get("confederationId")
  const birthDate = formData.get("birthDate")
  const shirtNumber = formData.get("shirtNumber")
  const resetPassword = formData.get("resetPassword")
  const categorias = formData.getAll("categorias")

  if (!id || typeof id !== "string") {
    redirect("/home/atletas?error=ID inválido.")
  }

  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    redirect(`/home/atletas/editar/${id}?error=Nome é obrigatório.`)
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect(`/home/atletas/editar/${id}?error=Sobrenome é obrigatório.`)
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect(`/home/atletas/editar/${id}?error=Telefone é obrigatório.`)
  }

  if (!birthDate || typeof birthDate !== "string") {
    redirect(`/home/atletas/editar/${id}?error=Data de nascimento é obrigatória.`)
  }

  if (categorias.length === 0) {
    redirect(`/home/atletas/editar/${id}?error=Selecione pelo menos uma categoria.`)
  }

  const birthDateObj = new Date(birthDate)

  // Busca o userId do atleta
  const athlete = await prisma.athlete.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!athlete) {
    redirect(`/home/atletas/editar/${id}?error=Atleta não encontrado.`)
  }

  // Atualiza o atleta
  await prisma.athlete.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      federationId: federationId && typeof federationId === "string" ? federationId.trim() : null,
      confederationId:
        confederationId && typeof confederationId === "string" ? confederationId.trim() : null,
      birthDate: birthDateObj,
      shirtNumber: shirtNumber && typeof shirtNumber === "string" ? shirtNumber.trim() : null,
      categories: {
        deleteMany: {},
        create: categorias.map((catId) => ({
          categoryId: catId as string,
        })),
      },
    },
  })

  // Prepara os dados para atualizar o User
  const userUpdateData: {
    name: string
    phone: string
    password?: string
  } = {
    name: `${firstName.trim()} ${lastName.trim()}`,
    phone: phone.trim(),
  }

  // Se resetPassword for "1", atualiza para a senha padrão
  if (resetPassword === "1") {
    const DEFAULT_PASSWORD = "12345678"
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
    userUpdateData.password = passwordHash
  }

  // Atualiza o nome e telefone (e senha se fornecida) no User
  await prisma.user.update({
    where: { id: athlete.userId },
    data: userUpdateData,
  })

  revalidatePath("/home/atletas")
  redirect(
    `/home/atletas?success=Atleta atualizado com sucesso!${
      resetPassword === "1" ? " Senha redefinida para 12345678." : ""
    }`,
  )
}

export async function deleteAtleta(id: string) {
  if (!id || typeof id !== "string") {
    redirect("/home/atletas?error=ID inválido.")
  }

  await prisma.athlete.delete({
    where: { id },
  })

  revalidatePath("/home/atletas")
  redirect("/home/atletas?success=Atleta deletado com sucesso!")
}

export async function generateAtletaInviteLink(formData: FormData) {
  const categorias = formData.getAll("categorias")

  if (categorias.length === 0) {
    redirect("/home/atletas/adicionar?error=Selecione pelo menos uma categoria.&tab=convite")
  }

  const token = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

  await prisma.athleteInvite.create({
    data: {
      token,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const link = `${baseUrl}/atleta/convite/${token}?categorias=${categorias.join(",")}`

  redirect(`/home/atletas/adicionar?link=${encodeURIComponent(link)}&tab=convite`)
}

