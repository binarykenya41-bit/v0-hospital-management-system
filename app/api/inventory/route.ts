import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()

  const items = await sql`
    SELECT i.*, s.name as supplier_name
    FROM inventory i
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    WHERE i.deleted_at IS NULL
    ORDER BY i.item_name ASC
  `

  const suppliers = await sql`SELECT * FROM suppliers WHERE is_active = true ORDER BY name ASC`

  return NextResponse.json({ items, suppliers })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const body = await request.json()

  const result = await sql`
    INSERT INTO inventory (
      item_name, category, quantity, unit, reorder_level,
      unit_cost, supplier_id, department, location
    ) VALUES (
      ${body.item_name}, ${body.category || null}, ${body.quantity || 0},
      ${body.unit || null}, ${body.reorder_level || 10},
      ${body.unit_cost || 0}, ${body.supplier_id || null},
      ${body.department || null}, ${body.location || null}
    ) RETURNING *
  `

  return NextResponse.json(result[0], { status: 201 })
}
