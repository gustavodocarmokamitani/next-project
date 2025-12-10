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
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email." },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    const session = await createSession(user.id)

    const response = NextResponse.json({ user }, { status: 201 })
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
    console.error("[AUTH_REGISTER]", error)
    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 500 },
    )
  }
}

