import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Building2, Users, Trophy, Calendar, DollarSign, ArrowLeft, Edit, UserCog } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/app/components/back-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notFound } from "next/navigation"

export default async function OrganizacaoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session || session.role !== "SYSTEM") {
    redirect("/login")
  }

  const { id } = await params

  // Busca a organização com todos os dados relacionados
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      managers: {
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      athletes: {
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      events: {
        orderBy: {
          date: "desc",
        },
        take: 10,
        include: {
          payments: {
            include: {
              items: true,
            },
          },
        },
      },
      organizedChampionships: {
        orderBy: {
          startDate: "desc",
        },
        take: 10,
      },
      categories: {
        include: {
          payments: {
            include: {
              payment: {
                include: {
                  items: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          admin: true,
          managers: true,
          athletes: true,
          events: true,
          organizedChampionships: true,
        },
      },
    },
  })

  if (!organization) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <BackButton href="/home/sistema/organizacoes" className="md:hidden" />
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">{organization.name}</h1>
            </div>
            <p className="text-muted-foreground">
              Criada em {new Date(organization.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link href={`/home/sistema/organizacoes/${id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Dados
            </Link>
          </Button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{organization._count.admin}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{organization._count.managers}</p>
            <p className="text-xs text-muted-foreground">Gerentes</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{organization._count.athletes}</p>
            <p className="text-xs text-muted-foreground">Atletas</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{organization._count.events}</p>
            <p className="text-xs text-muted-foreground">Eventos</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{organization._count.organizedChampionships}</p>
            <p className="text-xs text-muted-foreground">Campeonatos</p>
          </div>
        </div>

        {/* Botão Editar Mobile */}
        <div className="md:hidden mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/home/sistema/organizacoes/${id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Dados
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs com Dados Detalhados */}
      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="campeonatos">Campeonatos</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
        </TabsList>

        {/* Tab: Usuários */}
        <TabsContent value="usuarios" className="space-y-6">
          {/* Admins */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Administradores ({organization._count.admin})
            </h3>
            {organization.admin.length === 0 ? (
              <p className="text-muted-foreground">Nenhum administrador cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {organization.admin.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div>
                      <p className="font-medium">{admin.name || "Sem nome"}</p>
                      <p className="text-sm text-muted-foreground">
                        {admin.email || admin.phone || "Sem contato"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cadastrado em {new Date(admin.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Gerentes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Gerentes ({organization._count.managers})
            </h3>
            {organization.managers.length === 0 ? (
              <p className="text-muted-foreground">Nenhum gerente cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {organization.managers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {manager.firstName} {manager.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {manager.phone || manager.email || "Sem contato"}
                      </p>
                      {manager.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {manager.categories.map((mc) => (
                            <span
                              key={mc.categoryId}
                              className="px-2 py-1 rounded-md bg-muted text-xs"
                            >
                              {mc.category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Atletas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Atletas ({organization._count.athletes})
            </h3>
            {organization.athletes.length === 0 ? (
              <p className="text-muted-foreground">Nenhum atleta cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {organization.athletes.slice(0, 20).map((athlete) => (
                  <div
                    key={athlete.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {athlete.firstName} {athlete.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {athlete.phone || athlete.email || "Sem contato"}
                      </p>
                      {athlete.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {athlete.categories.map((ac) => (
                            <span
                              key={ac.categoryId}
                              className="px-2 py-1 rounded-md bg-muted text-xs"
                            >
                              {ac.category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {organization.athletes.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Mostrando 20 de {organization.athletes.length} atletas
                  </p>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Eventos */}
        <TabsContent value="eventos" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Eventos ({organization._count.events})
            </h3>
            {organization.events.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {organization.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/home/eventos/${event.id}`}>Ver Detalhes</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Campeonatos */}
        <TabsContent value="campeonatos" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Campeonatos Organizados ({organization._count.organizedChampionships})
            </h3>
            {organization.organizedChampionships.length === 0 ? (
              <p className="text-muted-foreground">Nenhum campeonato organizado.</p>
            ) : (
              <div className="space-y-3">
                {organization.organizedChampionships.map((championship) => (
                  <div
                    key={championship.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{championship.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Início:{" "}
                        {new Date(championship.startDate).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {championship.location && (
                        <p className="text-sm text-muted-foreground">{championship.location}</p>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/home/campeonatos/${championship.id}`}>Ver Detalhes</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Pagamentos */}
        <TabsContent value="pagamentos" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pagamentos
            </h3>
            <div className="space-y-3">
              {/* Pagamentos de Eventos */}
              {organization.events.some((e) => e.payments && e.payments.length > 0) ? (
                organization.events
                  .filter((e) => e.payments && e.payments.length > 0)
                  .map((event) =>
                    event.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{payment.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Evento: {event.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Vencimento:{" "}
                            {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {payment.items.length} item(ns)
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/home/despesas/${payment.id}/itens`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    )),
                  )
              ) : (
                <p className="text-muted-foreground">
                  Nenhum pagamento associado a eventos.
                </p>
              )}

              {/* Pagamentos de Categorias */}
              {organization.categories.some(
                (c) => c.payments && c.payments.length > 0,
              ) ? (
                organization.categories
                  .filter((c) => c.payments && c.payments.length > 0)
                  .map((category) =>
                    category.payments.map((pc) => {
                      const payment = pc.payment
                      return (
                        <div
                          key={payment.id}
                          className="flex items-start justify-between p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{payment.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Categoria: {category.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento:{" "}
                              {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {payment.items.length} item(ns)
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/home/despesas/${payment.id}/itens`}>
                              Ver Detalhes
                            </Link>
                          </Button>
                        </div>
                      )
                    }),
                  )
              ) : (
                organization.events.every((e) => !e.payments || e.payments.length === 0) && (
                  <p className="text-muted-foreground">
                    Nenhum pagamento cadastrado para esta organização.
                  </p>
                )
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Dados */}
        <TabsContent value="dados" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações da Organização</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{organization.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-mono text-sm">{organization.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Criação</p>
                <p className="font-medium">
                  {new Date(organization.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="font-medium">
                  {new Date(organization.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {organization.stripeAccountId && (
                <div>
                  <p className="text-sm text-muted-foreground">Stripe Account ID</p>
                  <p className="font-mono text-sm">{organization.stripeAccountId}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

