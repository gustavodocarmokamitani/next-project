"use client"

import { Trophy, Users, CheckCircle2, DollarSign } from "lucide-react"
import type { CampeonatoAnalyticsDTO } from "./queries"

type AnalyticsContentProps = {
  analytics: CampeonatoAnalyticsDTO
}

export function AnalyticsContent({ analytics }: AnalyticsContentProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Organizações</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">{analytics.totalOrganizacoes}</div>
            <p className="text-xs text-muted-foreground">
              organizações participantes
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total de Inscrições</h3>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">{analytics.totalInscricoes}</div>
            <p className="text-xs text-muted-foreground">
              atletas inscritos
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Inscrições Confirmadas</h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">{analytics.totalInscricoesConfirmadas}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalInscricoes > 0
                ? `${Math.round((analytics.totalInscricoesConfirmadas / analytics.totalInscricoes) * 100)}% confirmadas`
                : "Nenhuma inscrição"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Esperado</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="pt-2">
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.pagamentos.totalEsperado)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.pagamentos.totalPendente)} pendente
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas por Organização */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Estatísticas por Organização</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics.organizacoes.map((organizacao) => (
            <div key={organizacao.id} className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-primary" />
                  {organizacao.nome}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {organizacao.totalInscricoes} inscrições • {organizacao.totalConfirmadas} confirmadas
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Confirmação</span>
                  <span className="font-medium">
                    {organizacao.totalInscricoes > 0
                      ? `${Math.round((organizacao.totalConfirmadas / organizacao.totalInscricoes) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                {organizacao.categorias.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm font-medium text-foreground">
                      Categorias ({organizacao.categorias.length})
                    </p>
                    <div className="space-y-1">
                      {organizacao.categorias.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between text-xs text-muted-foreground"
                        >
                          <span>{cat.nome}</span>
                          <span>{cat.totalAtletas} atleta(s)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo de Pagamentos */}
      {analytics.pagamentos.totalEsperado > 0 && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Resumo de Pagamentos
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Esperado</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(analytics.pagamentos.totalEsperado)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.pagamentos.totalPago)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pendente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(analytics.pagamentos.totalPendente)}
                </p>
              </div>
            </div>
          </div>

          {/* Detalhamento de Despesas por Organização */}
          {analytics.pagamentos.despesasPorOrganizacao.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Detalhamento de Despesas por Organização
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Valor esperado e valor recebido de cada organização participante
                </p>
              </div>
              <div className="space-y-3">
                {analytics.pagamentos.despesasPorOrganizacao.map((org) => (
                  <div
                    key={org.organizacaoId}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {org.organizacaoNome}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-xs">
                          {org.totalAtletasConfirmados} atleta(s) confirmado(s)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Valor esperado: {formatCurrency(org.valorEsperado)}
                        </span>
                        <span>•</span>
                        <span className={org.valorRecebido > 0 ? "text-green-600" : ""}>
                          Valor recebido: {formatCurrency(org.valorRecebido)}
                        </span>
                        {org.valorPendente > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600">
                              Pendente: {formatCurrency(org.valorPendente)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(org.valorEsperado)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Esperado
                        </p>
                      </div>
                      {org.valorRecebido > 0 && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(org.valorRecebido)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recebido
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


