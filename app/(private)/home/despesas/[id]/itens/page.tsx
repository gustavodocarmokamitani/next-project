import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getDespesaById } from "../../queries"
import { BackButton } from "@/app/components/back-button"
import { AlertMessage } from "@/app/components/alert-message"
import { ItensForm } from "./itens-form"
import { ItemCard } from "./item-card"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

type DespesaItensPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function DespesaItensPage({ params }: DespesaItensPageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params
  const despesa = await getDespesaById(id)

  if (!despesa) {
    notFound()
  }

  const totalValue = despesa.items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <AlertMessage />
      </Suspense>

      {/* Header Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <BackButton className="md:hidden w-full" href="/home/despesas" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              Itens do Pagamento: {despesa.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Adicione os itens que serão cobrados neste pagamento
            </p>
          </div>
          {despesa.items.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalValue.toFixed(2)}
                </p>
              </div>
              <Button asChild>
                <Link href="/home/despesas">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Finalizar
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <ItensForm despesaId={despesa.id} />
      </div>

      {/* Items List */}
      {despesa.items.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Itens Adicionados ({despesa.items.length})
          </h2>
          <div className="space-y-3">
            {despesa.items.map((item) => (
              <ItemCard key={item.id} item={item} paymentId={despesa.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

