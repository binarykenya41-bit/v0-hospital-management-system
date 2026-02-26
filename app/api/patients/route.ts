import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const sql = getDb()

  let patients, total

  if (search) {
    patients = await sql`
      SELECT * FROM patients 
      WHERE deleted_at IS NULL 
        AND (
          first_name ILIKE ${'%' + search + '%'} 
          OR last_name ILIKE ${'%' + search + '%'}
          OR patient_number ILIKE ${'%' + search + '%'}
          OR national_id ILIKE ${'%' + search + '%'}
          OR sha_number ILIKE ${'%' + search + '%'}
        )
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `
    total = await sql`
      SELECT COUNT(*) as count FROM patients 
      WHERE deleted_at IS NULL 
        AND (
          first_name ILIKE ${'%' + search + '%'} 
          OR last_name ILIKE ${'%' + search + '%'}
          OR patient_number ILIKE ${'%' + search + '%'}
          OR national_id ILIKE ${'%' + search + '%'}
          OR sha_number ILIKE ${'%' + search + '%'}
        )
    `
  } else {
    patients = await sql`
      SELECT * FROM patients 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `
    total = await sql`SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL`
  }

  return NextResponse.json({
    patients,
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

  // Generate patient number
  const lastPatient = await sql`
    SELECT patient_number FROM patients 
    ORDER BY created_at DESC LIMIT 1
  `
  let nextNum = 1
  if (lastPatient.length > 0) {
    const parts = lastPatient[0].patient_number.split('-')
    nextNum = parseInt(parts[parts.length - 1]) + 1
  }
  const patientNumber = `MTRH-2026-${String(nextNum).padStart(4, '0')}`

  const result = await sql`
    INSERT INTO patients (
      patient_number, national_id, first_name, last_name, other_names,
      date_of_birth, gender, phone, email, county, sub_county, ward,
      address, blood_group, sha_number, insurance_provider, insurance_number,
      next_of_kin_name, next_of_kin_phone, next_of_kin_relationship,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
      referral_source, referral_hospital, patient_type, created_by
    ) VALUES (
      ${patientNumber}, ${body.national_id}, ${body.first_name}, ${body.last_name}, ${body.other_names || null},
      ${body.date_of_birth || null}, ${body.gender}, ${body.phone || null}, ${body.email || null}, 
      ${body.county || null}, ${body.sub_county || null}, ${body.ward || null},
      ${body.address || null}, ${body.blood_group || null}, ${body.sha_number || null}, 
      ${body.insurance_provider || null}, ${body.insurance_number || null},
      ${body.next_of_kin_name || null}, ${body.next_of_kin_phone || null}, ${body.next_of_kin_relationship || null},
      ${body.emergency_contact_name || null}, ${body.emergency_contact_phone || null}, ${body.emergency_contact_relationship || null},
      ${body.referral_source || null}, ${body.referral_hospital || null}, ${body.patient_type || 'outpatient'}, ${session.id}
    ) RETURNING *
  `

  return NextResponse.json(result[0], { status: 201 })
}
