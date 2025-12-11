import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { UserInfo } from "@/app/components/user-info";
import { LogoutButton } from "@/app/components/logout-button";
import { SettingsButton } from "@/app/components/settings-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Trophy,
  CircleDollarSign,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Sparkles,
  Layers,
  UserCog,
  ChartBar,
} from "lucide-react";
import { getHomeStats } from "./queries";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const stats = await getHomeStats();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {session.name || "Usuário"}!
            </h1>
            {session.teamName && (
              <p className="text-lg text-primary font-semibold mb-2">
                {session.teamName}
              </p>
            )}
            <p className="text-muted-foreground">
              Este é o seu painel de controle para gerenciar a equipe e os
              eventos. Vamos começar!
            </p>
          </div>
          <div className="flex items-center  gap-3 mt-4 md:mt-0 w-full justify-between md:w-auto md:justify-end">
            <SettingsButton />
            <LogoutButton />
          </div>
        </div>

        {/* User Info Card */}
        <div className="mb-6">
          <UserInfo />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/home/analytics">
              <ChartBar className="h-6 w-6" />
              <span>Analytics</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/home/categorias">
              <Layers className="h-6 w-6" />
              <span>Gerenciar Categorias</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/home/gerentes">
              <UserCog className="h-6 w-6" />
              <span>Adicionar Gerentes</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/home/atletas">
              <Users className="h-6 w-6" />
              <span>Cadastrar Atletas</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/home/eventos">
              <Trophy className="h-6 w-6" />
              <span>Criar Eventos</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/home/despesas">
              <CircleDollarSign className="h-6 w-6" />
              <span>Criar Despesas</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total de Atletas
            </h3>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalAtletas}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalAtletas === 0
              ? "Sem atletas cadastrados"
              : stats.totalAtletas === 1
                ? "1 atleta cadastrado"
                : `${stats.totalAtletas} atletas cadastrados`}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Eventos Ativos
            </h3>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.eventosAtivos}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.eventosAtivos === 0
              ? "Nenhum evento ativo"
              : stats.eventosAtivos === 1
                ? "1 evento ativo"
                : `${stats.eventosAtivos} eventos ativos`}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Pagamentos Pendentes
            </h3>
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.pagamentosPendentes}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pagamentosPendentes === 0
              ? "Todos em dia"
              : stats.pagamentosPendentes === 1
                ? "1 pagamento pendente"
                : `${stats.pagamentosPendentes} pagamentos pendentes`}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Analytics
            </h3>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">-</p>
          <p className="text-xs text-muted-foreground mt-1">
            Visualizar relatórios
          </p>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Guia de Primeiros Passos
          </h2>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Primeiro: Gerenciar Categorias
              </h3>
              <p className="text-sm text-muted-foreground">
                Como{" "}
                <strong className="text-foreground">
                  Proprietário da Equipe
                </strong>
                , você pode{" "}
                <strong className="text-primary">
                  criar e apagar as categorias
                </strong>{" "}
                como primeiro passo essencial.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Em seguida: Adicionar Gerentes
              </h3>
              <p className="text-sm text-muted-foreground">
                Após criar as categorias, adicione e gerencie os{" "}
                <strong className="text-primary">
                  Gerentes das Categorias
                </strong>
                .
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Depois: Cadastre os Atletas
              </h3>
              <p className="text-sm text-muted-foreground">
                Com os gerentes em lugar, registre os{" "}
                <strong className="text-primary">Atletas</strong> em suas
                respectivas categorias.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Eventos e Despesas
              </h3>
              <p className="text-sm text-muted-foreground">
                Quando a equipe estiver pronta, você pode{" "}
                <strong className="text-primary">
                  criar eventos e despesas
                </strong>{" "}
                para eventos específicos ou despesas gerais.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              5
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Por fim: Configurações e Senhas
              </h3>
              <p className="text-sm text-muted-foreground">
                Na seção <strong className="text-primary">⚙️ Settings</strong>,
                você pode{" "}
                <strong className="text-primary">redefinir a senha</strong> de
                Gerentes e Atletas. Também é possível{" "}
                <strong className="text-primary">
                  baixar relatórios gerenciais
                </strong>{" "}
                para monitorar a saúde financeira e de eventos da equipe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
