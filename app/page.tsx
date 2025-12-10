import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  UsersRound, 
  Trophy, 
  Calendar, 
  CreditCard, 
  UserCog, 
  BarChart3,
  CheckCircle2,
  Sparkles,
  Shield,
  Smartphone,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="home" className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-20 scroll-mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-muted-foreground text-sm">
            <Users className="h-4 w-4" />
            <span>Gestão centralizada de equipes esportivas</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-5xl lg:text-5xl font-bold text-foreground leading-tight">
            Simplifique a Gestão da Sua Equipe
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Team Manager centraliza o gerenciamento de atletas, equipes, eventos e pagamentos em uma única plataforma. Organize competições, controle financeiro e acompanhe participações com inteligência e segurança.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/register">Começar Agora</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Funcionalidades Section */}
      <section id="funcionalidades" className="py-20 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua equipe esportiva de forma profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gestão de Atletas */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Gestão de Atletas</h3>
              <p className="text-muted-foreground text-sm">
                Registro completo com dados pessoais, CPF, federação, número da camisa, categorias e histórico de eventos e pagamentos.
              </p>
            </div>

            {/* Gestão de Equipes */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <UsersRound className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Gestão de Equipes</h3>
              <p className="text-muted-foreground text-sm">
                Crie e gerencie equipes com hierarquias, permissões e múltiplos usuários. Histórico completo de criação e atualizações.
              </p>
            </div>

            {/* Categorias */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Categorias</h3>
              <p className="text-muted-foreground text-sm">
                Classifique atletas por idade, nível e tipo. Vincule a gerentes e eventos, com controle de cobrança por categoria.
              </p>
            </div>

            {/* Eventos */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Eventos</h3>
              <p className="text-muted-foreground text-sm">
                Crie competições com data, local e tipo. Controle de status, vinculação a categorias e confirmação de participação.
              </p>
            </div>

            {/* Pagamentos */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Controle de Pagamentos</h3>
              <p className="text-muted-foreground text-sm">
                Crie faturas com vencimento, itens de pagamento (taxas, materiais, hospedagem) e integração PIX. Controle completo de quem pagou e quando.
              </p>
            </div>

            {/* Gerentes */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Gerentes</h3>
              <p className="text-muted-foreground text-sm">
                Gerencie responsáveis por categorias e atletas. Vinculação com telefone, dados pessoais e atribuição a múltiplas categorias.
              </p>
            </div>

            {/* Confirmações */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Confirmações</h3>
              <p className="text-muted-foreground text-sm">
                Atletas confirmam participação em eventos, selecionam itens de pagamento e controlam quantidades. Histórico completo de confirmações.
              </p>
            </div>

            {/* Analytics */}
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Visualize participações em eventos, histórico de pagamentos por atleta e estatísticas de confirmações em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços Section */}
      <section id="precos" className="py-20 px-4 bg-muted/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Planos que Crescem com Você
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua organização
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plano Básico */}
            <div className="p-8 rounded-lg border border-border bg-card">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Básico</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">R$ 99</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Até 50 atletas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">1 equipe</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Eventos ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Controle de pagamentos</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Suporte por email</span>
                </li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/register">Começar Agora</Link>
              </Button>
            </div>

            {/* Plano Profissional */}
            <div className="p-8 rounded-lg border-2 border-primary bg-card relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  Mais Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Profissional</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">R$ 299</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Até 200 atletas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Equipes ilimitadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Eventos ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">PIX integrado</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Analytics avançado</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Suporte prioritário</span>
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/register">Começar Agora</Link>
              </Button>
            </div>

            {/* Plano Enterprise */}
            <div className="p-8 rounded-lg border border-border bg-card">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Atletas ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Equipes ilimitadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">API personalizada</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">White-label</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Gerente de conta dedicado</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Suporte 24/7</span>
                </li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/contact">Falar com Vendas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-20 px-4 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nossa História
            </h2>
          </div>

          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            <p>
              Tudo começou quando um grupo de gestores esportivos se reuniu após mais um campeonato caótico. Planilhas do Excel espalhadas em diferentes computadores, confirmações perdidas no WhatsApp, pagamentos esquecidos e a frustração de não ter uma visão clara do que estava acontecendo com suas equipes.
            </p>

            <p>
              Foi então que percebemos: <strong className="text-foreground">não existia uma solução verdadeiramente pensada para o mundo esportivo</strong>. As ferramentas disponíveis eram genéricas, complicadas ou simplesmente não atendiam às necessidades específicas de confederações, federações e equipes esportivas.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-12">
              <div className="p-6 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Antes</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Planilhas espalhadas em múltiplos arquivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Comunicação via WhatsApp sem registro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Controle manual de pagamentos (propenso a erros)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Dificuldade em rastrear confirmações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Sem visibilidade centralizada dos dados</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Agora</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Tudo centralizado em um só lugar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Histórico completo de eventos e pagamentos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Controle automatizado com PIX integrado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Analytics e relatórios em tempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Segurança com JWT e permissões por função</span>
                  </li>
                </ul>
              </div>
            </div>

            <p>
              Assim nasceu o <strong className="text-foreground">Team Manager</strong>. Uma plataforma desenvolvida por quem entende as dores do dia a dia da gestão esportiva. Construímos cada funcionalidade pensando nas necessidades reais: desde o cadastro completo de atletas até o controle financeiro integrado, passando pela organização de eventos e o acompanhamento de participações.
            </p>

            <p>
              Hoje, o Team Manager é usado por confederações, federações e equipes de todo o Brasil que descobriram que <strong className="text-foreground">gerenciar uma equipe esportiva não precisa ser complicado</strong>. Com segurança, inteligência e simplicidade, transformamos a gestão esportiva em algo que realmente funciona.
            </p>

            <div className="mt-12 p-8 rounded-lg border border-border bg-muted/30 text-center">
              <div className="flex flex-wrap justify-center gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-foreground font-medium">Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-foreground font-medium">Rápido</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <span className="text-foreground font-medium">Responsivo</span>
                </div>
              </div>
              <p className="text-foreground font-semibold">
                Feito por gestores esportivos, para gestores esportivos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
