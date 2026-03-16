import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb } from '@/lib/mock-db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const doctors = (db.users as Record<string, unknown>[])
    .filter((u) => u.role_id === 3 && u.is_active)
    .map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      department: u.department,
      staff_number: u.staff_number,
    }))
    .sort((a, b) => String(a.first_name).localeCompare(String(b.first_name)))

  return NextResponse.json({ doctors })
}
