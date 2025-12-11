import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { GerenteSidebar } from "@/app/components/gerente-sidebar"

export default async function GerenteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Apenas GERENTE pode acessar
  if (session.role !== "GERENTE") {
    redirect("/home")
  }

  return (
    <div className="flex min-h-screen">
      <GerenteSidebar />
      <main className="flex-1 w-full p-4 md:p-8 md:ml-64">{children}</main>
    </div>
  )
}

