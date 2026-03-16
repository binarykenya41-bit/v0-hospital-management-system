import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb, generateId } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const db = readDb()
  let patients = db.patients as Record<string, unknown>[]

  if (search) {
    const q = search.toLowerCase()
    patients = patients.filter(
      (p) =>
        String(p.first_name).toLowerCase().includes(q) ||
        String(p.last_name).toLowerCase().includes(q) ||
        String(p.patient_number).toLowerCase().includes(q) ||
        String(p.national_id || '').toLowerCase().includes(q) ||
        String(p.sha_number || '').toLowerCase().includes(q)
    )
  }

  const total = patients.length
  const offset = (page - 1) * limit
  const paginated = patients.slice(offset, offset + limit)

  return NextResponse.json({
    patients: paginated,
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

  const nextNum = db.patients.length + 1
  const patientNumber = `MTRH-2026-${String(nextNum).padStart(4, '0')}`

  const newPatient: Record<string, unknown> = {
    id: generateId('p'),
    patient_number: patientNumber,
    national_id: body.national_id || null,
    first_name: body.first_name,
    last_name: body.last_name,
    other_names: body.other_names || null,
    date_of_birth: body.date_of_birth || null,
    gender: body.gender,
    phone: body.phone || null,
    email: body.email || null,
    county: body.county || null,
    sub_county: body.sub_county || null,
    ward: body.ward || null,
    address: body.address || null,
    blood_group: body.blood_group || null,
    sha_number: body.sha_number || null,
    insurance_provider: body.insurance_provider || null,
    insurance_number: body.insurance_number || null,
    next_of_kin_name: body.next_of_kin_name || null,
    next_of_kin_phone: body.next_of_kin_phone || null,
    next_of_kin_relationship: body.next_of_kin_relationship || null,
    referral_source: body.referral_source || null,
    referral_hospital: body.referral_hospital || null,
    patient_type: body.patient_type || 'outpatient',
    created_by: session.id,
    created_at: new Date().toISOString(),
  }

  db.patients.push(newPatient)
  writeDb(db)

  return NextResponse.json(newPatient, { status: 201 })
}
