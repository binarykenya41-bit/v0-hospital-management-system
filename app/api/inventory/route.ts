import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb, generateId } from '@/lib/mock-db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const items = (db.inventory as Record<string, unknown>[]).sort((a, b) =>
    String(a.item_name).localeCompare(String(b.item_name))
  )
  const suppliers = (db.suppliers as Record<string, unknown>[]).filter((s) => s.is_active)

  return NextResponse.json({ items, suppliers })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const body = await request.json()

  const supplier = body.supplier_id
    ? (db.suppliers.find((s) => (s as Record<string, unknown>).id === body.supplier_id) as Record<string, unknown> | undefined)
    : undefined

  const newItem: Record<string, unknown> = {
    id: generateId('i'),
    item_name: body.item_name,
    category: body.category || null,
    quantity: body.quantity || 0,
    unit: body.unit || null,
    reorder_level: body.reorder_level || 10,
    unit_cost: body.unit_cost || 0,
    supplier_id: body.supplier_id || null,
    supplier_name: supplier ? supplier.name : null,
    department: body.department || null,
    location: body.location || null,
    created_at: new Date().toISOString(),
  }

  db.inventory.push(newItem)
  writeDb(db)

  return NextResponse.json(newItem, { status: 201 })
}
