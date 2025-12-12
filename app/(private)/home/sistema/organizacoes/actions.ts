"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

export async function updateOrganizacao(formData: FormData) {
  const session = await getSession()
  
  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  const id = formData.get("id")
  const name = formData.get("name")
  const stripeAccountId = formData.get("stripeAccountId")

  if (!id || typeof id !== "string") {
    redirect("/home/sistema/organizacoes?error=ID inválido.")
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    redirect(`/home/sistema/organizacoes/${id}/editar?error=Nome da organização é obrigatório.`)
  }

  // Verifica se já existe outra organização com o mesmo nome
  const existingOrg = await prisma.organization.findFirst({
    where: {
      name: name.trim(),
      NOT: { id },
    },
  })

  if (existingOrg) {
    redirect(`/home/sistema/organizacoes/${id}/editar?error=Já existe uma organização com este nome.`)
  }

  await prisma.organization.update({
    where: { id },
    data: {
      name: name.trim(),
      stripeAccountId: stripeAccountId && typeof stripeAccountId === "string" && stripeAccountId.trim().length > 0
        ? stripeAccountId.trim()
        : null,
    },
  })

  revalidatePath("/home/sistema/organizacoes")
  revalidatePath(`/home/sistema/organizacoes/${id}`)
  redirect(`/home/sistema/organizacoes/${id}?success=Organização atualizada com sucesso!`)
}

