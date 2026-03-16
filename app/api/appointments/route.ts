import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb, generateId } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const db = readDb()
  let appointments = db.appointments as Record<string, unknown>[]

  if (date) {
    appointments = appointments.filter((a) => a.appointment_date === date)
  }
  if (status) {
    appointments = appointments.filter((a) => a.status === status)
  }

  // Sort by date desc, time asc
  appointments = [...appointments].sort((a, b) => {
    const dateCompare = String(b.appointment_date).localeCompare(String(a.appointment_date))
    if (dateCompare !== 0) return dateCompare
    return String(a.appointment_time).localeCompare(String(b.appointment_time))
  })

  const total = appointments.length
  const offset = (page - 1) * limit
  const paginated = appointments.slice(offset, offset + limit)

  return NextResponse.json({
    appointments: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const body = await request.json()

  // Look up patient details
  const patient = db.patients.find((p) => (p as Record<string, unknown>).id === body.patient_id) as Record<string, unknown> | undefined
  const doctor = body.doctor_id
    ? (db.users.find((u) => (u as Record<string, unknown>).id === body.doctor_id) as Record<string, unknown> | undefined)
    : undefined

  const newAppointment: Record<string, unknown> = {
    id: generateId('a'),
    patient_id: body.patient_id,
    doctor_id: body.doctor_id || null,
    appointment_date: body.appointment_date,
    appointment_time: body.appointment_time,
    appointment_type: body.appointment_type,
    clinic: body.clinic || null,
    status: 'scheduled',
    priority: body.priority || 'normal',
    reason: body.reason || null,
    notes: body.notes || null,
    patient_first_name: patient ? patient.first_name : null,
    patient_last_name: patient ? patient.last_name : null,
    patient_number: patient ? patient.patient_number : null,
    doctor_first_name: doctor ? doctor.first_name : null,
    doctor_last_name: doctor ? doctor.last_name : null,
    created_by: session.id,
    created_at: new Date().toISOString(),
  }

  db.appointments.push(newAppointment)
  writeDb(db)

  return NextResponse.json(newAppointment, { status: 201 })
}
