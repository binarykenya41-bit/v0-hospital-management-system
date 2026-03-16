import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb } from '@/lib/mock-db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const staff = (db.users as Record<string, unknown>[])
    .map((u) => ({
      id: u.id,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      department: u.department,
      phone: u.phone,
      national_id: u.national_id,
      staff_number: u.staff_number,
      is_active: u.is_active,
      last_login: u.last_login,
      created_at: u.created_at,
      role_name: u.role_name,
      role_description: null,
    }))
    .sort((a, b) => String(a.first_name).localeCompare(String(b.first_name)))

  return NextResponse.json({ staff })
}
