import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"

export default async function AtletaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Apenas ATLETA pode acessar
  if (session.role !== "ATLETA") {
    redirect("/home")
  }

  return (
    <div className="min-h-screen">
      <main className="p-4 md:p-8">{children}</main>
    </div>
  )
}

