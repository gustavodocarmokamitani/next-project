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
    const { organizationName, adminName, adminPhone, adminEmail, password } = await req.json()

    if (!organizationName || !adminName || !adminPhone || !adminEmail || !password) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos." },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 },
      )
    }

    // Verifica se já existe uma organização com este nome
    const existingOrg = await prisma.organization.findFirst({
      where: { name: organizationName.trim() },
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: "Já existe uma organização com este nome." },
        { status: 409 },
      )
    }

    // Verifica se já existe um usuário com este telefone
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone: adminPhone },
    })

    if (existingUserByPhone) {
      return NextResponse.json(
        { error: "Já existe um usuário com este telefone." },
        { status: 409 },
      )
    }

    // Verifica se já existe um usuário com este email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: adminEmail.trim() },
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email." },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Cria a organização e o admin em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Cria a organização
      const organizacao = await tx.organization.create({
        data: {
          name: organizationName.trim(),
        },
      })

      // Cria o usuário admin
      const user = await tx.user.create({
        data: {
          phone: adminPhone,
          password: passwordHash,
          name: adminName.trim(),
          email: adminEmail.trim(),
          role: "ADMIN",
          organizationId: organizacao.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      })

      return { organizacao, user }
    })

    const session = await createSession(result.user.id)

    const response = NextResponse.json({ user: result.user }, { status: 201 })
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

