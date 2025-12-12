"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"

export async function createAtletaGerente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

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
    redirect("/gerente/atletas/adicionar?error=Nome é obrigatório.")
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect("/gerente/atletas/adicionar?error=Sobrenome é obrigatório.")
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect("/gerente/atletas/adicionar?error=Telefone é obrigatório.")
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    redirect("/gerente/atletas/adicionar?error=Senha deve ter no mínimo 6 caracteres.")
  }

  if (!birthDate || typeof birthDate !== "string") {
    redirect("/gerente/atletas/adicionar?error=Data de nascimento é obrigatória.")
  }

  if (categorias.length === 0) {
    redirect("/gerente/atletas/adicionar?error=Selecione pelo menos uma categoria.")
  }

  // Valida se as categorias selecionadas são das categorias do gerente
  const categoriasSelecionadas = categorias as string[]
  const categoriasInvalidas = categoriasSelecionadas.filter(
    (catId) => !session.categoryIds?.includes(catId),
  )

  if (categoriasInvalidas.length > 0) {
    redirect("/gerente/atletas/adicionar?error=Você não pode adicionar atletas em categorias que não gerencia.")
  }

  // Verifica se já existe um usuário/atleta com este telefone
  const existingUser = await prisma.user.findUnique({ where: { phone: phone.trim() } })
  const existingAthlete = await prisma.athlete.findUnique({ where: { phone: phone.trim() } })

  if (existingUser || existingAthlete) {
    redirect("/gerente/atletas/adicionar?error=Já existe um usuário ou atleta com este telefone.")
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

  // Busca o organizationId do gerente
  if (!session.organizationId) {
    redirect("/gerente/atletas/adicionar?error=Organização não encontrada.")
  }

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
      organizationId: session.organizationId,
      categories: {
        create: categoriasSelecionadas.map((catId) => ({
          categoryId: catId,
        })),
      },
    },
  })

  revalidatePath("/gerente/atletas")
  redirect("/gerente/atletas?success=Atleta cadastrado com sucesso!")
}

export async function updateAtletaGerente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
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
    redirect("/gerente/atletas?error=ID inválido.")
  }

  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    redirect(`/gerente/atletas/editar/${id}?error=Nome é obrigatório.`)
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect(`/gerente/atletas/editar/${id}?error=Sobrenome é obrigatório.`)
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect(`/gerente/atletas/editar/${id}?error=Telefone é obrigatório.`)
  }

  if (!birthDate || typeof birthDate !== "string") {
    redirect(`/gerente/atletas/editar/${id}?error=Data de nascimento é obrigatória.`)
  }

  if (categorias.length === 0) {
    redirect(`/gerente/atletas/editar/${id}?error=Selecione pelo menos uma categoria.`)
  }

  // Verifica se o atleta existe e está em uma categoria do gerente
  const atleta = await prisma.athlete.findFirst({
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
    select: { userId: true },
  })

  if (!atleta) {
    redirect(`/gerente/atletas/editar/${id}?error=Atleta não encontrado ou você não tem permissão para editá-lo.`)
  }

  // Valida se as categorias selecionadas são das categorias do gerente
  const categoriasSelecionadas = categorias as string[]
  const categoriasInvalidas = categoriasSelecionadas.filter(
    (catId) => !session.categoryIds?.includes(catId),
  )

  if (categoriasInvalidas.length > 0) {
    redirect(`/gerente/atletas/editar/${id}?error=Você não pode adicionar atletas em categorias que não gerencia.`)
  }

  const birthDateObj = new Date(birthDate)

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
        create: categoriasSelecionadas.map((catId) => ({
          categoryId: catId,
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
    where: { id: atleta.userId },
    data: userUpdateData,
  })

  revalidatePath("/gerente/atletas")
  redirect(
    `/gerente/atletas?success=Atleta atualizado com sucesso!${
      resetPassword === "1" ? " Senha redefinida para 12345678." : ""
    }`,
  )
}

export async function deleteAtletaGerente(id: string) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  if (!id || typeof id !== "string") {
    redirect("/gerente/atletas?error=ID inválido.")
  }

  // Verifica se o atleta existe e está em uma categoria do gerente
  const atleta = await prisma.athlete.findFirst({
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
  })

  if (!atleta) {
    redirect("/gerente/atletas?error=Atleta não encontrado ou você não tem permissão para deletá-lo.")
  }

  await prisma.athlete.delete({
    where: { id },
  })

  revalidatePath("/gerente/atletas")
  redirect("/gerente/atletas?success=Atleta deletado com sucesso!")
}

export async function generateAtletaInviteLinkGerente(formData: FormData) {
  const session = await getSession()

  if (!session || !session.managerId || !session.categoryIds || session.role !== "GERENTE") {
    redirect("/login")
  }

  const categorias = formData.getAll("categorias") as string[]

  if (categorias.length === 0) {
    redirect("/gerente/atletas/adicionar?error=Selecione pelo menos uma categoria.&tab=convite")
  }

  // Valida se as categorias selecionadas são das categorias do gerente
  const categoriasInvalidas = categorias.filter((catId) => !session.categoryIds?.includes(catId))

  if (categoriasInvalidas.length > 0) {
    redirect(
      "/gerente/atletas/adicionar?error=Você não pode criar convites para categorias que não gerencia.&tab=convite",
    )
  }

  // Busca o organizationId do gerente
  if (!session.organizationId) {
    redirect("/gerente/atletas/adicionar?error=Organização não encontrada.&tab=convite")
  }

  const token = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expira em 7 dias

  await prisma.athleteInvite.create({
    data: {
      token,
      expiresAt,
      organizationId: session.organizationId,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const link = `${baseUrl}/atleta/convite/${token}?categorias=${categorias.join(",")}`

  redirect(`/gerente/atletas/adicionar?link=${encodeURIComponent(link)}&tab=convite`)
}

