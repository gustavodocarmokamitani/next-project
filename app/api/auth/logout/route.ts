import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "session_token"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      // Aqui você pode deletar a sessão do banco de dados se necessário
      // await prisma.session.delete({ where: { token: sessionToken } })
    }

    const response = NextResponse.json({ success: true }, { status: 200 })

    // Remove o cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[AUTH_LOGOUT]", error)
    return NextResponse.json(
      { error: "Não foi possível fazer logout." },
      { status: 500 },
    )
  }
}

