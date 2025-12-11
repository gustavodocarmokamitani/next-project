import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { Sidebar } from "@/app/components/sidebar"

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Redireciona baseado no role
  if (session.role === "GERENTE") {
    redirect("/gerente")
  } else if (session.role === "ATLETA") {
    redirect("/atleta")
  }

  // Apenas ADMIN acessa /home
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full p-4 md:p-8 md:ml-64">{children}</main>
    </div>
  )
}

