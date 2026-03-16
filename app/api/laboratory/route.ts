import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb, generateId } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  const db = readDb()
  let tests = db.lab_tests as Record<string, unknown>[]

  if (status) {
    tests = tests.filter((t) => t.status === status)
  }

  tests = [...tests].sort(
    (a, b) => String(b.requested_at).localeCompare(String(a.requested_at))
  )

  return NextResponse.json({ tests })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const body = await request.json()

  const patient = db.patients.find((p) => (p as Record<string, unknown>).id === body.patient_id) as Record<string, unknown> | undefined
  const doctor = (body.doctor_id || session.id)
    ? (db.users.find((u) => (u as Record<string, unknown>).id === (body.doctor_id || session.id)) as Record<string, unknown> | undefined)
    : undefined

  const newTest: Record<string, unknown> = {
    id: generateId('lt'),
    patient_id: body.patient_id,
    doctor_id: body.doctor_id || session.id,
    test_name: body.test_name,
    test_category: body.test_category || null,
    urgency: body.urgency || 'routine',
    notes: body.notes || null,
    status: 'pending',
    result_text: null,
    reference_range: null,
    is_abnormal: false,
    requested_at: new Date().toISOString(),
    completed_at: null,
    patient_first_name: patient ? patient.first_name : null,
    patient_last_name: patient ? patient.last_name : null,
    patient_number: patient ? patient.patient_number : null,
    doctor_first_name: doctor ? doctor.first_name : null,
    doctor_last_name: doctor ? doctor.last_name : null,
  }

  db.lab_tests.push(newTest)
  writeDb(db)

  return NextResponse.json(newTest, { status: 201 })
}
