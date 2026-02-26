import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()

  const staff = await sql`
    SELECT u.id, u.email, u.first_name, u.last_name, u.department,
           u.phone, u.national_id, u.staff_number, u.is_active, u.last_login,
           u.created_at, r.name as role_name, r.description as role_description
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.deleted_at IS NULL
    ORDER BY u.first_name ASC
  `

  return NextResponse.json({ staff })
}
