"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import bcrypt from "bcryptjs"

export async function updateGerentePerfil(formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "GERENTE" || !session.managerId) {
    redirect("/login")
  }

  const id = formData.get("id")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const phone = formData.get("phone")

  if (!id || typeof id !== "string" || id !== session.managerId) {
    redirect("/gerente/configuracoes?error=ID inválido.")
  }

  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    redirect("/gerente/configuracoes?error=Nome é obrigatório.")
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    redirect("/gerente/configuracoes?error=Sobrenome é obrigatório.")
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    redirect("/gerente/configuracoes?error=Telefone é obrigatório.")
  }

  // Verifica se o telefone já está sendo usado por outro gerente
  const existingManager = await prisma.manager.findUnique({
    where: { phone: phone.trim() },
  })

  if (existingManager && existingManager.id !== id) {
    redirect("/gerente/configuracoes?error=Este telefone já está em uso.")
  }

  // Busca o userId do gerente
  const manager = await prisma.manager.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!manager) {
    redirect("/gerente/configuracoes?error=Gerente não encontrado.")
  }

  // Atualiza o gerente (sem alterar categorias)
  await prisma.manager.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    },
  })

  // Atualiza o nome e telefone no User também
  await prisma.user.update({
    where: { id: manager.userId },
    data: {
      name: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim(),
    },
  })

  revalidatePath("/gerente")
  revalidatePath("/gerente/configuracoes")
  redirect("/gerente/configuracoes?success=Perfil atualizado com sucesso!")
}

export async function updateGerenteSenha(formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "GERENTE" || !session.managerId) {
    redirect("/login")
  }

  const currentPassword = formData.get("currentPassword")
  const newPassword = formData.get("newPassword")
  const confirmPassword = formData.get("confirmPassword")

  if (!currentPassword || typeof currentPassword !== "string") {
    redirect("/gerente/configuracoes?error=Senha atual é obrigatória.")
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    redirect("/gerente/configuracoes?error=A nova senha deve ter no mínimo 6 caracteres.")
  }

  if (newPassword !== confirmPassword) {
    redirect("/gerente/configuracoes?error=As senhas não coincidem.")
  }

  // Busca o usuário do gerente
  const manager = await prisma.manager.findUnique({
    where: { id: session.managerId },
    select: { userId: true },
  })

  if (!manager) {
    redirect("/gerente/configuracoes?error=Gerente não encontrado.")
  }

  const user = await prisma.user.findUnique({
    where: { id: manager.userId },
  })

  if (!user) {
    redirect("/gerente/configuracoes?error=Usuário não encontrado.")
  }

  // Verifica a senha atual
  const isValidPassword = await bcrypt.compare(currentPassword, user.password)

  if (!isValidPassword) {
    redirect("/gerente/configuracoes?error=Senha atual incorreta.")
  }

  // Criptografa a nova senha
  const newPasswordHash = await bcrypt.hash(newPassword, 10)

  // Atualiza a senha
  await prisma.user.update({
    where: { id: manager.userId },
    data: {
      password: newPasswordHash,
    },
  })

  revalidatePath("/gerente/configuracoes")
  redirect("/gerente/configuracoes?success=Senha alterada com sucesso!")
}

