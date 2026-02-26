import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const sql = getDb()

  let appointments
  if (date) {
    appointments = await sql`
      SELECT a.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.deleted_at IS NULL AND a.appointment_date = ${date}
      ${status ? sql`AND a.status = ${status}` : sql``}
      ORDER BY a.appointment_time ASC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else {
    appointments = await sql`
      SELECT a.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.deleted_at IS NULL
      ${status ? sql`AND a.status = ${status}` : sql``}
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
      LIMIT ${limit} OFFSET ${offset}
    `
  }

  const total = await sql`SELECT COUNT(*) as count FROM appointments WHERE deleted_at IS NULL`

  return NextResponse.json({
    appointments,
    total: Number(total[0].count),
    page,
    totalPages: Math.ceil(Number(total[0].count) / limit),
  })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const body = await request.json()

  const result = await sql`
    INSERT INTO appointments (
      patient_id, doctor_id, appointment_date, appointment_time,
      appointment_type, clinic, status, priority, reason, notes, created_by
    ) VALUES (
      ${body.patient_id}, ${body.doctor_id || null}, ${body.appointment_date}, ${body.appointment_time},
      ${body.appointment_type}, ${body.clinic || null}, 'scheduled',
      ${body.priority || 'normal'}, ${body.reason || null}, ${body.notes || null}, ${session.id}
    ) RETURNING *
  `

  return NextResponse.json(result[0], { status: 201 })
}
