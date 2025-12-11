import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { Sidebar } from "../components/sidebar"

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      <main className="flex-1 mx-auto w-full p-8">{children}</main>
    </div>
  )
}

