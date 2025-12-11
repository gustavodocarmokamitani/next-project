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
    const {
      firstName,
      lastName,
      phone,
      password,
      token,
      categorias,
      federationId,
      confederationId,
      birthDate,
      shirtNumber,
    } = await req.json()

    if (!firstName || !lastName || !phone || !password || !token || !birthDate) {
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

    // Verifica se o token de convite é válido
    const invite = await prisma.athleteInvite.findUnique({
      where: { token },
    })

    if (!invite) {
      return NextResponse.json(
        { error: "Link de convite inválido." },
        { status: 400 },
      )
    }

    if (invite.used) {
      return NextResponse.json(
        { error: "Este link de convite já foi utilizado." },
        { status: 400 },
      )
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Este link de convite expirou." },
        { status: 400 },
      )
    }

    // Verifica se já existe um usuário com este telefone
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este telefone." },
        { status: 409 },
      )
    }

    // Verifica se já existe um atleta com este telefone
    const existingAthlete = await prisma.athlete.findUnique({
      where: { phone },
    })

    if (existingAthlete) {
      return NextResponse.json(
        { error: "Já existe um atleta com este telefone." },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const birthDateObj = new Date(birthDate)

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        phone,
        password: passwordHash,
        name: `${firstName} ${lastName}`,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    })

    // Cria o atleta
    await prisma.athlete.create({
      data: {
        firstName,
        lastName,
        phone,
        federationId: federationId || null,
        confederationId: confederationId || null,
        birthDate: birthDateObj,
        shirtNumber: shirtNumber || null,
        userId: user.id,
        categories: {
          create: categorias.map((catId: string) => ({
            categoryId: catId,
          })),
        },
      },
    })

    // Marca o convite como usado
    await prisma.athleteInvite.update({
      where: { id: invite.id },
      data: { used: true },
    })

    const session = await createSession(user.id)

    const response = NextResponse.json(
      { user, message: "Atleta cadastrado com sucesso!" },
      { status: 201 },
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
    console.error("[ATLETA_REGISTER]", error)
    return NextResponse.json(
      { error: "Não foi possível criar a conta do atleta." },
      { status: 500 },
    )
  }
}

