import "server-only"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/get-session"

// Dados mockados para teste - descomente a linha abaixo para usar
// import { getCampeonatoAnalyticsMock } from "./queries-mock"

export type CampeonatoAnalyticsDTO = {
  id: string
  nome: string
  totalOrganizacoes: number
  totalInscricoes: number
  totalInscricoesConfirmadas: number
  organizacoes: {
    id: string
    nome: string
    totalInscricoes: number
    totalConfirmadas: number
    categorias: {
      id: string
      nome: string
      totalAtletas: number
    }[]
  }[]
  pagamentos: {
    totalEsperado: number
    totalPago: number
    totalPendente: number
    despesasPorOrganizacao: {
      organizacaoId: string
      organizacaoNome: string
      totalAtletasConfirmados: number
      valorEsperado: number
      valorRecebido: number
      valorPendente: number
    }[]
  }
}

export async function getCampeonatoAnalytics(
  campeonatoId: string,
): Promise<CampeonatoAnalyticsDTO | null> {
  // Dados mockados para teste - descomente a linha abaixo para usar
  // return getCampeonatoAnalyticsMock(campeonatoId)

  //  Código comentado quando usando dados mockados
  const session = await getSession()

  if (!session || (session.role !== "ADMIN" && session.role !== "SYSTEM")) {
    return null
  }
  
  // SYSTEM não precisa de organizationId, ADMIN precisa
  if (session.role === "ADMIN" && !session.organizationId) {
    return null
  }

  // Verifica se o campeonato pertence à organização (SYSTEM pode ver qualquer campeonato)
  const whereClause = session.role === "SYSTEM"
    ? { id: campeonatoId }
    : { id: campeonatoId, organizerId: session.organizationId }
  
  const campeonato = await (prisma as any).championship.findFirst({
    where: whereClause,
    include: {
      categories: {
        include: {
          entries: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
              athleteEntries: {
                include: {
                  athlete: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      payments: {
        include: {
          items: true,
        },
      },
    },
  })

  if (!campeonato) {
    return null
  }

  // Calcula estatísticas por organização
  const organizacoesUnicas = new Set<string>()
  let totalInscricoes = 0
  let totalInscricoesConfirmadas = 0

  // Mapa para agrupar por organização
  const organizacoesMap = new Map<
    string,
    {
      nome: string
      totalInscricoes: number
      totalConfirmadas: number
      categorias: Map<string, { nome: string; totalAtletas: number }>
    }
  >()

  campeonato.categories.forEach((cat: any) => {
    cat.entries.forEach((entry: any) => {
      const orgId = entry.organizationId
      const orgNome = entry.organization.name

      organizacoesUnicas.add(orgId)

      if (!organizacoesMap.has(orgId)) {
        organizacoesMap.set(orgId, {
          nome: orgNome,
          totalInscricoes: 0,
          totalConfirmadas: 0,
          categorias: new Map(),
        })
      }

      const org = organizacoesMap.get(orgId)!
      const atletasInscritos = entry.athleteEntries.length
      const confirmadas = entry.athleteEntries.filter((ae: any) => ae.confirmed).length

      org.totalInscricoes += atletasInscritos
      org.totalConfirmadas += confirmadas
      totalInscricoes += atletasInscritos
      totalInscricoesConfirmadas += confirmadas

      // Adiciona categoria à organização
      if (!org.categorias.has(cat.id)) {
        org.categorias.set(cat.id, {
          nome: cat.name,
          totalAtletas: 0,
        })
      }
      const categoria = org.categorias.get(cat.id)!
      categoria.totalAtletas += atletasInscritos
    })
  })

  const organizacoesComStats = Array.from(organizacoesMap.entries()).map(([orgId, org]) => ({
    id: orgId,
    nome: org.nome,
    totalInscricoes: org.totalInscricoes,
    totalConfirmadas: org.totalConfirmadas,
    categorias: Array.from(org.categorias.entries()).map(([catId, cat]) => ({
      id: catId,
      nome: cat.nome,
      totalAtletas: cat.totalAtletas,
    })),
  }))

  // Calcula pagamentos por organização
  const payment = campeonato.payments[0] || null
  let totalEsperado = 0
  let totalPago = 0

  // Calcula despesas por organização
  const despesasPorOrganizacao: Array<{
    organizacaoId: string
    organizacaoNome: string
    totalAtletasConfirmados: number
    valorEsperado: number
    valorRecebido: number
    valorPendente: number
  }> = []

  if (payment && payment.items.length > 0) {
    organizacoesMap.forEach((org, orgId) => {
      let valorEsperadoOrg = 0

      // Para cada despesa, calcula o valor esperado para esta organização
      payment.items.forEach((item: any) => {
        if (item.isFixed) {
          // Despesa fixa: divide igualmente entre todas as organizações
          // (ou pode ser paga apenas pela organização organizadora, dependendo da regra de negócio)
          // Por enquanto, vamos dividir igualmente
          const numOrganizacoes = organizacoesMap.size
          valorEsperadoOrg += item.value / numOrganizacoes
        } else {
          // Despesa normal: multiplica pelo número de atletas confirmados desta organização
          // Usa totalConfirmadas que já foi calculado anteriormente
          if (item.quantityEnabled) {
            // Se permite quantidade, assume 1 unidade por atleta confirmado
            // (quando houver sistema de seleção de itens, isso será ajustado)
            valorEsperadoOrg += item.value * org.totalConfirmadas
          } else {
            // Se não permite quantidade, cada atleta paga 1x o valor
            valorEsperadoOrg += item.value * org.totalConfirmadas
          }
        }
      })

      totalEsperado += valorEsperadoOrg

      // TODO: Implementar cálculo de valorRecebido quando houver sistema de pagamento para campeonatos
      // Por enquanto, valorRecebido fica em 0
      const valorRecebidoOrg = 0
      totalPago += valorRecebidoOrg

      despesasPorOrganizacao.push({
        organizacaoId: orgId,
        organizacaoNome: org.nome,
        totalAtletasConfirmados: org.totalConfirmadas,
        valorEsperado: valorEsperadoOrg,
        valorRecebido: valorRecebidoOrg,
        valorPendente: valorEsperadoOrg - valorRecebidoOrg,
      })
    })
  }

  return {
    id: campeonato.id,
    nome: campeonato.name,
    totalOrganizacoes: organizacoesUnicas.size,
    totalInscricoes,
    totalInscricoesConfirmadas,
    organizacoes: organizacoesComStats,
    pagamentos: {
      totalEsperado,
      totalPago,
      totalPendente: totalEsperado - totalPago,
      despesasPorOrganizacao,
    },
  }
}

