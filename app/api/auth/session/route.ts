import { NextResponse } from 'next/server'
import { getSession, getPermissions } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({
    user: session,
    permissions: getPermissions(session.role),
  })
}
