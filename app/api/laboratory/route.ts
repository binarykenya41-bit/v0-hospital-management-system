import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  const sql = getDb()

  const tests = await sql`
    SELECT lt.*, 
      p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
      u.first_name as doctor_first_name, u.last_name as doctor_last_name
    FROM lab_tests lt
    JOIN patients p ON lt.patient_id = p.id
    LEFT JOIN users u ON lt.doctor_id = u.id
    WHERE lt.deleted_at IS NULL
    ${status ? sql`AND lt.status = ${status}` : sql``}
    ORDER BY lt.requested_at DESC
    LIMIT 50
  `

  return NextResponse.json({ tests })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const body = await request.json()

  const result = await sql`
    INSERT INTO lab_tests (
      patient_id, doctor_id, test_name, test_category, urgency, notes
    ) VALUES (
      ${body.patient_id}, ${body.doctor_id || session.id},
      ${body.test_name}, ${body.test_category || null},
      ${body.urgency || 'routine'}, ${body.notes || null}
    ) RETURNING *
  `

  return NextResponse.json(result[0], { status: 201 })
}
