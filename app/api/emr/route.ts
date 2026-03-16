import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb, generateId } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patient_id') || ''

  const db = readDb()
  const records = ((db as unknown as Record<string, unknown[]>).emr_records || []) as Record<string, unknown>[]

  const filtered = patientId ? records.filter((r) => r.patient_id === patientId) : records
  const sorted = [...filtered].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))

  return NextResponse.json({ records: sorted })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const body = await request.json()

  const patient = db.patients.find((p) => (p as Record<string, unknown>).id === body.patient_id) as Record<string, unknown> | undefined

  const newRecord: Record<string, unknown> = {
    id: generateId('emr'),
    patient_id: body.patient_id,
    patient_number: patient ? patient.patient_number : null,
    patient_name: patient ? `${patient.first_name} ${patient.last_name}` : null,
    record_type: body.record_type || 'consultation',
    diagnosis: body.diagnosis || null,
    icd10_code: body.icd10_code || null,
    chief_complaint: body.chief_complaint || null,
    history_of_illness: body.history_of_illness || null,
    examination_findings: body.examination_findings || null,
    treatment_plan: body.treatment_plan || null,
    clinical_notes: body.clinical_notes || null,
    created_by: session.id,
    doctor_name: `${session.firstName} ${session.lastName}`,
    created_at: new Date().toISOString(),
  }

  const dbRaw = db as unknown as Record<string, unknown[]>
  if (!dbRaw.emr_records) {
    dbRaw.emr_records = []
  }
  dbRaw.emr_records.push(newRecord)
  writeDb(db)

  return NextResponse.json(newRecord, { status: 201 })
}
