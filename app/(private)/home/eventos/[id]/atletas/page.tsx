import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getSession } from "@/lib/get-session"
import { getEventoDetalhes, getAtletasDoEvento } from "./queries"
import { notFound } from "next/navigation"
import { AtletasEventoContent } from "./atletas-content"
import { BackButton } from "@/app/components/back-button"

type AtletasEventoPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    success?: string
    error?: string
  }>
}

export default async function AtletasEventoPage({
  params,
  searchParams,
}: AtletasEventoPageProps) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/login")
  }

  const { id } = await params
  const { success, error } = await searchParams

  const evento = await getEventoDetalhes(id)

  if (!evento) {
    notFound()
  }

  const atletas = await getAtletasDoEvento(id)

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      <div className="mb-4 sm:mb-6">
      <BackButton className="md:hidden w-full mb-4" href="/home/eventos" />
     
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
          <span className="hidden sm:inline">Gerenciar Atletas - </span>
          <span className="sm:hidden">Atletas - </span>
          {evento.name}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Confirme presenças e registre pagamentos dos atletas para este evento
        </p>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <AtletasEventoContent evento={evento} atletas={atletas} success={success} error={error} />
      </Suspense>
    </div>
  )
}

