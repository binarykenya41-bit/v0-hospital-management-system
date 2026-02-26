import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()

  const doctors = await sql`
    SELECT u.id, u.first_name, u.last_name, u.department, u.staff_number
    FROM users u
    WHERE u.role_id = 3 AND u.is_active = true AND u.deleted_at IS NULL
    ORDER BY u.first_name ASC
  `

  return NextResponse.json({ doctors })
}
