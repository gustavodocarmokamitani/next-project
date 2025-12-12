"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import bcrypt from "bcryptjs"

export async function updateAdminPerfil(formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  const id = formData.get("id")
  const name = formData.get("name")
  const email = formData.get("email")
  const organizationName = formData.get("organizationName")

  if (!id || typeof id !== "string" || id !== session.id) {
    redirect("/home/configuracoes?error=ID inválido.")
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect("/home/configuracoes?error=Nome é obrigatório.")
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    redirect("/home/configuracoes?error=Email é obrigatório.")
  }

  // Verifica se o email já está sendo usado por outro usuário
  const existingUser = await prisma.user.findUnique({
    where: { email: email.trim() },
  })

  if (existingUser && existingUser.id !== id) {
    redirect("/home/configuracoes?error=Este email já está em uso.")
  }

  // Atualiza o usuário
  await prisma.user.update({
    where: { id },
    data: {
      name: name.trim(),
      email: email.trim(),
      organizationName: organizationName && typeof organizationName === "string" ? organizationName.trim() : null,
    },
  })

  revalidatePath("/home")
  revalidatePath("/home/configuracoes")
  redirect("/home/configuracoes?success=Perfil atualizado com sucesso!")
}

export async function updateAdminSenha(formData: FormData) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  const currentPassword = formData.get("currentPassword")
  const newPassword = formData.get("newPassword")
  const confirmPassword = formData.get("confirmPassword")

  if (!currentPassword || typeof currentPassword !== "string") {
    redirect("/home/configuracoes?error=Senha atual é obrigatória.")
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    redirect("/home/configuracoes?error=A nova senha deve ter no mínimo 6 caracteres.")
  }

  if (newPassword !== confirmPassword) {
    redirect("/home/configuracoes?error=As senhas não coincidem.")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  })

  if (!user) {
    redirect("/home/configuracoes?error=Usuário não encontrado.")
  }

  // Verifica a senha atual
  const isValidPassword = await bcrypt.compare(currentPassword, user.password)

  if (!isValidPassword) {
    redirect("/home/configuracoes?error=Senha atual incorreta.")
  }

  // Criptografa a nova senha
  const newPasswordHash = await bcrypt.hash(newPassword, 10)

  // Atualiza a senha
  await prisma.user.update({
    where: { id: session.id },
    data: {
      password: newPasswordHash,
    },
  })

  revalidatePath("/home/configuracoes")
  redirect("/home/configuracoes?success=Senha alterada com sucesso!")
}

