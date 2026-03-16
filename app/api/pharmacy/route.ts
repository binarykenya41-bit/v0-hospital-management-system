import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb, generateId } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || ''

  const db = readDb()
  let medicines = (db.medicines as Record<string, unknown>[]).filter((m) => m.is_active)

  const today = new Date()
  const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

  if (filter === 'low-stock') {
    medicines = medicines.filter((m) => Number(m.quantity_in_stock) <= Number(m.reorder_level))
    medicines.sort((a, b) => Number(a.quantity_in_stock) - Number(b.quantity_in_stock))
  } else if (filter === 'expiring') {
    medicines = medicines.filter((m) => {
      const expiry = new Date(String(m.expiry_date))
      return expiry <= ninetyDaysFromNow
    })
    medicines.sort((a, b) => String(a.expiry_date).localeCompare(String(b.expiry_date)))
  } else if (search) {
    const q = search.toLowerCase()
    medicines = medicines.filter(
      (m) =>
        String(m.name).toLowerCase().includes(q) ||
        String(m.generic_name || '').toLowerCase().includes(q)
    )
    medicines.sort((a, b) => String(a.name).localeCompare(String(b.name)))
  } else {
    medicines.sort((a, b) => String(a.name).localeCompare(String(b.name)))
  }

  return NextResponse.json({ medicines })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const body = await request.json()

  const newMedicine: Record<string, unknown> = {
    id: generateId('m'),
    name: body.name,
    generic_name: body.generic_name || null,
    category: body.category || null,
    dosage_form: body.dosage_form || null,
    strength: body.strength || null,
    unit: body.unit || null,
    batch_number: body.batch_number || null,
    expiry_date: body.expiry_date || null,
    quantity_in_stock: body.quantity_in_stock || 0,
    reorder_level: body.reorder_level || 10,
    unit_price: body.unit_price || 0,
    is_active: true,
    created_at: new Date().toISOString(),
  }

  db.medicines.push(newMedicine)
  writeDb(db)

  return NextResponse.json(newMedicine, { status: 201 })
}
