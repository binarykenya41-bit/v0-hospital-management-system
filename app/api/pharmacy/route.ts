import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || ''

  const sql = getDb()

  let medicines
  if (filter === 'low-stock') {
    medicines = await sql`
      SELECT * FROM medicines 
      WHERE deleted_at IS NULL AND is_active = true AND quantity_in_stock <= reorder_level
      ORDER BY quantity_in_stock ASC
    `
  } else if (filter === 'expiring') {
    medicines = await sql`
      SELECT * FROM medicines 
      WHERE deleted_at IS NULL AND is_active = true AND expiry_date <= CURRENT_DATE + INTERVAL '90 days'
      ORDER BY expiry_date ASC
    `
  } else if (search) {
    medicines = await sql`
      SELECT * FROM medicines 
      WHERE deleted_at IS NULL AND is_active = true
        AND (name ILIKE ${'%' + search + '%'} OR generic_name ILIKE ${'%' + search + '%'})
      ORDER BY name ASC
    `
  } else {
    medicines = await sql`
      SELECT * FROM medicines 
      WHERE deleted_at IS NULL AND is_active = true
      ORDER BY name ASC
    `
  }

  return NextResponse.json({ medicines })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const body = await request.json()

  const result = await sql`
    INSERT INTO medicines (
      name, generic_name, category, dosage_form, strength, unit,
      batch_number, expiry_date, quantity_in_stock, reorder_level, unit_price
    ) VALUES (
      ${body.name}, ${body.generic_name || null}, ${body.category || null},
      ${body.dosage_form || null}, ${body.strength || null}, ${body.unit || null},
      ${body.batch_number || null}, ${body.expiry_date || null},
      ${body.quantity_in_stock || 0}, ${body.reorder_level || 10}, ${body.unit_price || 0}
    ) RETURNING *
  `

  return NextResponse.json(result[0], { status: 201 })
}
