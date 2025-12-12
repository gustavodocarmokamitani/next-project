import { NextResponse } from "next/server"
import { getSession } from "@/lib/get-session"

export async function GET() {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ role: null }, { status: 200 })
  }

  return NextResponse.json({
    role: session.role,
    organizationId: session.organizationId,
  })
}

