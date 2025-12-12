"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"
import { randomBytes } from "crypto"

export async function createCampeonato(formData: FormData) {
  const session = await getSession()
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const nome = formData.get("nome")
  const descricao = formData.get("descricao")
  const dataInicio = formData.get("dataInicio")
  const dataFim = formData.get("dataFim")
  const local = formData.get("local")
  const organizerId = formData.get("organizerId") // Campo para SYSTEM selecionar organização

  // Determina o organizerId
  let finalOrganizerId: string
  
  if (session.role === "SYSTEM") {
    // SYSTEM deve fornecer organizerId
    if (!organizerId || typeof organizerId !== "string") {
      redirect("/home/campeonatos/adicionar?error=Organização organizadora é obrigatória.")
    }
    finalOrganizerId = organizerId
    
    // Verifica se a organização existe
    const org = await prisma.organization.findUnique({
      where: { id: finalOrganizerId },
      select: { id: true },
    })
    if (!org) {
      redirect("/home/campeonatos/adicionar?error=Organização não encontrada.")
    }
  } else {
    // ADMIN usa sua própria organização
    if (!session.organizationId) {
      redirect("/home/campeonatos/adicionar?error=Organização não encontrada.")
    }
    finalOrganizerId = session.organizationId
  }

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect("/home/campeonatos/adicionar?error=Nome do campeonato é obrigatório.")
  }

  if (!dataInicio || typeof dataInicio !== "string") {
    redirect("/home/campeonatos/adicionar?error=Data de início é obrigatória.")
  }

  const dataInicioObj = new Date(dataInicio)
  const dataFimObj = dataFim && typeof dataFim === "string" ? new Date(dataFim) : null

  if (dataFimObj && dataFimObj < dataInicioObj) {
    redirect("/home/campeonatos/adicionar?error=Data de fim deve ser posterior à data de início.")
  }

  // Processa as despesas do FormData
  const despesas: Array<{
    nome: string
    valor: string
    quantityEnabled: boolean
    isFixed: boolean
  }> = []

  let index = 0
  while (formData.get(`despesas[${index}][nome]`)) {
    const nome = formData.get(`despesas[${index}][nome]`)
    const valor = formData.get(`despesas[${index}][valor]`)
    const quantityEnabled = formData.get(`despesas[${index}][quantityEnabled]`) === "true"
    const isFixed = formData.get(`despesas[${index}][isFixed]`) === "true"

    if (nome && typeof nome === "string" && valor && typeof valor === "string") {
      despesas.push({
        nome: nome.trim(),
        valor: valor.trim(),
        quantityEnabled,
        isFixed,
      })
    }
    index++
  }

  // Processa as categorias do FormData
  const categoriasIds: string[] = []
  const categoriasFormData = formData.getAll("categorias")
  categoriasFormData.forEach((catId) => {
    if (typeof catId === "string" && catId.trim().length > 0) {
      categoriasIds.push(catId.trim())
    }
  })

  if (categoriasIds.length === 0) {
    redirect("/home/campeonatos/adicionar?error=Selecione pelo menos uma categoria.")
  }

  // Verifica se todas as categorias existem
  const categoriasExistentes = await prisma.category.findMany({
    where: {
      id: {
        in: categoriasIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (categoriasExistentes.length !== categoriasIds.length) {
    redirect("/home/campeonatos/adicionar?error=Uma ou mais categorias selecionadas não foram encontradas.")
  }

  // Cria o campeonato, categorias e despesas em uma transação
  await prisma.$transaction(async (tx) => {
    // Cria o campeonato
    const campeonato = await (tx as any).championship.create({
      data: {
        name: nome.trim(),
        description: descricao && typeof descricao === "string" ? descricao.trim() : null,
        startDate: dataInicioObj,
        endDate: dataFimObj,
        location: local && typeof local === "string" ? local.trim() : null,
        organizerId: finalOrganizerId,
      },
    })

    // Cria as categorias do campeonato
    for (const categoria of categoriasExistentes) {
      await (tx as any).championshipCategory.create({
        data: {
          championshipId: campeonato.id,
          categoryId: categoria.id,
          name: categoria.name,
          allowUpgrade: false, // Por padrão, não permite upgrade
        },
      })
    }

    // Se houver despesas, cria o Payment e os PaymentItems
    if (despesas.length > 0) {
      // Data de vencimento padrão: 7 dias antes do início do campeonato
      const dueDate = new Date(dataInicioObj)
      dueDate.setDate(dueDate.getDate() - 7)

      const payment = await tx.payment.create({
        data: {
          name: `Despesas - ${nome.trim()}`,
          dueDate,
          championshipId: campeonato.id,
        },
      })

      // Cria os itens de pagamento
      for (const despesa of despesas) {
        const valorNum = parseFloat(despesa.valor.replace(",", "."))
        if (isNaN(valorNum) || valorNum <= 0) {
          continue
        }

        await tx.paymentItem.create({
          data: {
            name: despesa.nome,
            value: valorNum,
            quantityEnabled: despesa.quantityEnabled,
            isFixed: despesa.isFixed,
            required: false, // Despesas de campeonato não são obrigatórias por padrão
            paymentId: payment.id,
          },
        })
      }
    }
  })

  revalidatePath("/home/campeonatos")
  redirect("/home/campeonatos?success=Campeonato criado com sucesso!")
}

export async function updateCampeonato(formData: FormData) {
  const session = await getSession()
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  const id = formData.get("id")
  const nome = formData.get("nome")
  const descricao = formData.get("descricao")
  const dataInicio = formData.get("dataInicio")
  const dataFim = formData.get("dataFim")
  const local = formData.get("local")

  if (!id || typeof id !== "string") {
    redirect("/home/campeonatos?error=ID inválido.")
  }

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    redirect(`/home/campeonatos/editar/${id}?error=Nome do campeonato é obrigatório.`)
  }

  if (!dataInicio || typeof dataInicio !== "string") {
    redirect(`/home/campeonatos/editar/${id}?error=Data de início é obrigatória.`)
  }

  // Verifica se o campeonato existe e se pertence à organização (SYSTEM pode editar qualquer um)
  const whereClause = session.role === "SYSTEM"
    ? { id }
    : { id, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    redirect("/home/campeonatos?error=Campeonato não encontrado.")
  }

  const dataInicioObj = new Date(dataInicio)
  const dataFimObj = dataFim && typeof dataFim === "string" ? new Date(dataFim) : null

  if (dataFimObj && dataFimObj < dataInicioObj) {
    redirect(`/home/campeonatos/editar/${id}?error=Data de fim deve ser posterior à data de início.`)
  }

  // Processa as categorias do FormData
  const categoriasIds: string[] = []
  const categoriasFormData = formData.getAll("categorias")
  categoriasFormData.forEach((catId) => {
    if (typeof catId === "string" && catId.trim().length > 0) {
      categoriasIds.push(catId.trim())
    }
  })

  if (categoriasIds.length === 0) {
    redirect(`/home/campeonatos/editar/${id}?error=Selecione pelo menos uma categoria.`)
  }

  // Verifica se todas as categorias existem
  const categoriasExistentes = await prisma.category.findMany({
    where: {
      id: {
        in: categoriasIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (categoriasExistentes.length !== categoriasIds.length) {
    redirect(`/home/campeonatos/editar/${id}?error=Uma ou mais categorias selecionadas não foram encontradas.`)
  }

  // Processa as despesas do FormData
  const despesas: Array<{
    id: string
    nome: string
    valor: string
    quantityEnabled: boolean
    isFixed: boolean
    isNew: boolean
    isDeleted: boolean
    isEdited: boolean
  }> = []

  let despesaIndex = 0
  while (formData.get(`despesas[${despesaIndex}][id]`)) {
    const despesaId = formData.get(`despesas[${despesaIndex}][id]`)
    const despesaNome = formData.get(`despesas[${despesaIndex}][nome]`)
    const despesaValor = formData.get(`despesas[${despesaIndex}][valor]`)
    const quantityEnabled =
      formData.get(`despesas[${despesaIndex}][quantityEnabled]`) === "true"
    const isFixed = formData.get(`despesas[${despesaIndex}][isFixed]`) === "true"
    const isNew = formData.get(`despesas[${despesaIndex}][isNew]`) === "true"
    const isDeleted =
      formData.get(`despesas[${despesaIndex}][isDeleted]`) === "true"
    const isEdited =
      formData.get(`despesas[${despesaIndex}][isEdited]`) === "true"

    if (
      despesaId &&
      typeof despesaId === "string" &&
      despesaNome &&
      typeof despesaNome === "string" &&
      despesaValor &&
      typeof despesaValor === "string"
    ) {
      despesas.push({
        id: despesaId.trim(),
        nome: despesaNome.trim(),
        valor: despesaValor.trim(),
        quantityEnabled,
        isFixed,
        isNew,
        isDeleted,
        isEdited,
      })
    }
    despesaIndex++
  }

  // Atualiza o campeonato, categorias e despesas em uma transação
  await prisma.$transaction(async (tx) => {
    // Atualiza o campeonato
    await (tx as any).championship.update({
      where: { id },
      data: {
        name: nome.trim(),
        description: descricao && typeof descricao === "string" ? descricao.trim() : null,
        startDate: dataInicioObj,
        endDate: dataFimObj,
        location: local && typeof local === "string" ? local.trim() : null,
      },
    })

    // Busca as categorias atuais do campeonato (apenas as que têm categoryId - categorias globais)
    const categoriasAtuais = await (tx as any).championshipCategory.findMany({
      where: {
        championshipId: id,
        categoryId: {
          not: null,
        },
      },
      select: {
        id: true,
        categoryId: true,
      },
    })

    const categoriasAtuaisIds = categoriasAtuais
      .map((cat: any) => cat.categoryId)
      .filter((id: string | null) => id !== null) as string[]

    // Identifica categorias para adicionar e remover
    const categoriasParaAdicionar = categoriasIds.filter(
      (catId) => !categoriasAtuaisIds.includes(catId),
    )
    const categoriasParaRemover = categoriasAtuaisIds.filter(
      (catId) => !categoriasIds.includes(catId),
    )

    // Remove categorias que não estão mais selecionadas
    if (categoriasParaRemover.length > 0) {
      await (tx as any).championshipCategory.deleteMany({
        where: {
          championshipId: id,
          categoryId: {
            in: categoriasParaRemover,
          },
        },
      })
    }

    // Adiciona novas categorias
    for (const categoria of categoriasExistentes) {
      if (categoriasParaAdicionar.includes(categoria.id)) {
        await (tx as any).championshipCategory.create({
          data: {
            championshipId: id,
            categoryId: categoria.id,
            name: categoria.name,
            allowUpgrade: false,
          },
        })
      }
    }

    // Processa as despesas
    // Busca o Payment do campeonato (ou cria se não existir)
    let payment = await tx.payment.findFirst({
      where: {
        championshipId: id,
      },
    })

    if (!payment) {
      // Se não existe Payment, cria um novo
      const dueDate = new Date(dataInicioObj)
      dueDate.setDate(dueDate.getDate() - 7)

      payment = await tx.payment.create({
        data: {
          name: `Despesas - ${nome.trim()}`,
          dueDate,
          championshipId: id,
        },
      })
    }

    // Processa cada despesa
    for (const despesa of despesas) {
      if (despesa.isDeleted) {
        // Remove despesa existente
        if (!despesa.isNew) {
          await tx.paymentItem.delete({
            where: { id: despesa.id },
          })
        }
      } else if (despesa.isNew) {
        // Adiciona nova despesa
        const valorNum = parseFloat(despesa.valor.replace(",", "."))
        if (!isNaN(valorNum) && valorNum > 0) {
          await tx.paymentItem.create({
            data: {
              name: despesa.nome,
              value: valorNum,
              quantityEnabled: despesa.quantityEnabled,
              isFixed: despesa.isFixed,
              required: false,
              paymentId: payment.id,
            },
          })
        }
      } else if (despesa.isEdited) {
        // Atualiza despesa existente
        const valorNum = parseFloat(despesa.valor.replace(",", "."))
        if (!isNaN(valorNum) && valorNum > 0) {
          await tx.paymentItem.update({
            where: { id: despesa.id },
            data: {
              name: despesa.nome,
              value: valorNum,
              quantityEnabled: despesa.quantityEnabled,
              isFixed: despesa.isFixed,
            },
          })
        }
      }
    }
  })

  revalidatePath("/home/campeonatos")
  revalidatePath(`/home/campeonatos/${id}`)
  redirect("/home/campeonatos?success=Campeonato atualizado com sucesso!")
}

export async function deleteCampeonato(id: string) {
  const session = await getSession()
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    redirect("/login")
  }

  if (!id || typeof id !== "string") {
    redirect("/home/campeonatos?error=ID inválido.")
  }

  // Verifica se o campeonato existe (SYSTEM pode deletar qualquer um)
  const whereClause = session.role === "SYSTEM"
    ? { id }
    : { id, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    redirect("/home/campeonatos?error=Campeonato não encontrado.")
  }

  await (prisma as any).championship.delete({
    where: { id },
  })

  revalidatePath("/home/campeonatos")
  redirect("/home/campeonatos?success=Campeonato deletado com sucesso!")
}

export async function getCampeonatoConviteLink(formData: FormData): Promise<string | null> {
  const session = await getSession()
  
  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return null
  }
  
  const campeonatoId = formData.get("campeonatoId")
  
  if (!campeonatoId || typeof campeonatoId !== "string") {
    return null
  }

  // Verifica se o campeonato pertence à organização (SYSTEM pode acessar qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { id: campeonatoId }
    : { id: campeonatoId, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    select: { id: true },
  })

  if (!campeonato) {
    return null
  }

  // Busca um convite público ativo
  const conviteAtivo = await (prisma as any).championshipInvite.findFirst({
    where: {
      championshipId: campeonatoId,
      organizationId: null, // Convite público
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      token: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (conviteAtivo) {
    // Retorna o link do convite existente
    return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/campeonato/convite/${conviteAtivo.token}`
  }

  // Se não houver convite ativo, cria um novo
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 dias

  await (prisma as any).championshipInvite.create({
    data: {
      championshipId: campeonatoId,
      organizationId: null, // Convite público
      token,
      expiresAt,
      used: false,
    },
  })

  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/campeonato/convite/${token}`
}

