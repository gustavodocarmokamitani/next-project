import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const SESSION_COOKIE_NAME = "session_token"
const SESSION_TTL_DAYS = 7

const createSession = async (userId: string) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS)

  const token = randomUUID()

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      )
    }

    const session = await createSession(user.id)

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 },
    )

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[AUTH_LOGIN]", error)
    return NextResponse.json(
      { error: "Não foi possível autenticar." },
      { status: 500 },
    )
  }
}

