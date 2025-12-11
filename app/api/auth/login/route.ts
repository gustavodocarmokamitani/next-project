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
    const { email, phone, password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: "Senha é obrigatória." },
        { status: 400 },
      )
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email ou telefone são obrigatórios." },
        { status: 400 },
      )
    }

    // Busca usuário por email ou telefone
    let user = null
    if (email) {
      user = await prisma.user.findUnique({ 
        where: { email },
        include: {
          manager: true,
          athlete: true,
        },
      })
    } else if (phone) {
      // Remove caracteres não numéricos do telefone
      const cleanPhone = phone.replace(/\D/g, "")
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: phone },
            { phone: cleanPhone },
            { manager: { phone: phone } },
            { manager: { phone: cleanPhone } },
            { athlete: { phone: phone } },
            { athlete: { phone: cleanPhone } },
          ],
        },
        include: {
          manager: true,
          athlete: true,
        },
      })
    }

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

    // Determina o tipo de usuário
    let role: "ADMIN" | "GERENTE" | "ATLETA" = "ADMIN"
    if (user.manager) {
      role = "GERENTE"
    } else if (user.athlete) {
      role = "ATLETA"
    }

    // Determina redirecionamento baseado no role
    let redirectPath = "/home"
    if (role === "GERENTE") {
      redirectPath = "/gerente"
    } else if (role === "ATLETA") {
      redirectPath = "/atleta"
    }

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role,
        },
        redirectPath,
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

