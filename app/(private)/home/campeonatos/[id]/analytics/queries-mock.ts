import "server-only"
import type { CampeonatoAnalyticsDTO } from "./queries"

/**
 * Retorna dados mockados para testar o analytics
 * Use esta função temporariamente substituindo getCampeonatoAnalytics
 */
export function getCampeonatoAnalyticsMock(
  campeonatoId: string,
): CampeonatoAnalyticsDTO | null {
  // Dados mockados de 5 organizações
  const organizacoesMock = [
    {
      id: "org-1",
      nome: "Clube Atlético São Paulo",
      totalInscricoes: 15,
      totalConfirmadas: 12,
      categorias: [
        { id: "cat-1", nome: "Adulto", totalAtletas: 8 },
        { id: "cat-2", nome: "Sub-23", totalAtletas: 4 },
        { id: "cat-3", nome: "Juvenil", totalAtletas: 3 },
      ],
    },
    {
      id: "org-2",
      nome: "Flamengo Esportes",
      totalInscricoes: 20,
      totalConfirmadas: 18,
      categorias: [
        { id: "cat-1", nome: "Adulto", totalAtletas: 10 },
        { id: "cat-2", nome: "Sub-23", totalAtletas: 5 },
        { id: "cat-4", nome: "Júnior", totalAtletas: 5 },
      ],
    },
    {
      id: "org-3",
      nome: "Confederação Brasileira",
      totalInscricoes: 25,
      totalConfirmadas: 22,
      categorias: [
        { id: "cat-1", nome: "Adulto", totalAtletas: 15 },
        { id: "cat-2", nome: "Sub-23", totalAtletas: 7 },
      ],
    },
    {
      id: "org-4",
      nome: "Time Unidos",
      totalInscricoes: 10,
      totalConfirmadas: 8,
      categorias: [
        { id: "cat-3", nome: "Juvenil", totalAtletas: 5 },
        { id: "cat-4", nome: "Júnior", totalAtletas: 5 },
      ],
    },
    {
      id: "org-5",
      nome: "Associação Esportiva Nacional",
      totalInscricoes: 18,
      totalConfirmadas: 15,
      categorias: [
        { id: "cat-1", nome: "Adulto", totalAtletas: 10 },
        { id: "cat-2", nome: "Sub-23", totalAtletas: 5 },
        { id: "cat-3", nome: "Juvenil", totalAtletas: 3 },
      ],
    },
  ]

  // Calcula totais
  const totalInscricoes = organizacoesMock.reduce(
    (sum, org) => sum + org.totalInscricoes,
    0,
  )
  const totalInscricoesConfirmadas = organizacoesMock.reduce(
    (sum, org) => sum + org.totalConfirmadas,
    0,
  )

  // Despesas mockadas
  // Café: R$ 15,00 (com quantidade) - não fixa
  // Almoço: R$ 30,00 (com quantidade) - não fixa
  // Inscrição: R$ 100,00 (fixa)
  // Árbitros: R$ 500,00 (fixa)

  // Calcula despesas por organização
  const despesasPorOrganizacao = organizacoesMock.map((org) => {
    // Despesas fixas divididas igualmente (Inscrição + Árbitros)
    const despesasFixas = (100 + 500) / organizacoesMock.length // R$ 120,00 por organização

    // Despesas normais multiplicadas por atletas confirmados
    const cafe = 15 * org.totalConfirmadas // R$ 15,00 por atleta
    const almoco = 30 * org.totalConfirmadas // R$ 30,00 por atleta

    const valorEsperado = despesasFixas + cafe + almoco

    // Simula alguns pagamentos parciais
    let valorRecebido = 0
    if (org.id === "org-1") {
      // Clube Atlético São Paulo pagou 50%
      valorRecebido = valorEsperado * 0.5
    } else if (org.id === "org-2") {
      // Flamengo Esportes pagou 100%
      valorRecebido = valorEsperado
    } else if (org.id === "org-3") {
      // Confederação Brasileira pagou 30%
      valorRecebido = valorEsperado * 0.3
    } else if (org.id === "org-4") {
      // Time Unidos não pagou nada ainda
      valorRecebido = 0
    } else if (org.id === "org-5") {
      // Associação Esportiva Nacional pagou 75%
      valorRecebido = valorEsperado * 0.75
    }

    return {
      organizacaoId: org.id,
      organizacaoNome: org.nome,
      totalAtletasConfirmados: org.totalConfirmadas,
      valorEsperado: Math.round(valorEsperado * 100) / 100,
      valorRecebido: Math.round(valorRecebido * 100) / 100,
      valorPendente: Math.round((valorEsperado - valorRecebido) * 100) / 100,
    }
  })

  const totalEsperado = despesasPorOrganizacao.reduce(
    (sum, org) => sum + org.valorEsperado,
    0,
  )
  const totalPago = despesasPorOrganizacao.reduce(
    (sum, org) => sum + org.valorRecebido,
    0,
  )

  return {
    id: campeonatoId,
    nome: "Campeonato Nacional de Teste",
    totalOrganizacoes: organizacoesMock.length,
    totalInscricoes,
    totalInscricoesConfirmadas,
    organizacoes: organizacoesMock,
    pagamentos: {
      totalEsperado: Math.round(totalEsperado * 100) / 100,
      totalPago: Math.round(totalPago * 100) / 100,
      totalPendente: Math.round((totalEsperado - totalPago) * 100) / 100,
      despesasPorOrganizacao,
    },
  }
}

