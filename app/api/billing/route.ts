import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb, generateId } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  const db = readDb()
  let invoices = db.invoices as Record<string, unknown>[]

  if (status) {
    invoices = invoices.filter((i) => i.status === status)
  }

  invoices = [...invoices].sort(
    (a, b) => String(b.created_at).localeCompare(String(a.created_at))
  )

  return NextResponse.json({ invoices: invoices.slice(0, 50) })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const body = await request.json()

  const patient = db.patients.find((p) => (p as Record<string, unknown>).id === body.patient_id) as Record<string, unknown> | undefined

  const nextNum = db.invoices.length + 1
  const invoiceNumber = `INV-2026-${String(nextNum).padStart(5, '0')}`

  const newInvoice: Record<string, unknown> = {
    id: generateId('inv'),
    invoice_number: invoiceNumber,
    patient_id: body.patient_id,
    billing_type: body.billing_type || 'Cash',
    sha_number: body.sha_number || null,
    insurance_provider: body.insurance_provider || null,
    insurance_number: body.insurance_number || null,
    subtotal: body.subtotal || 0,
    total: body.total || 0,
    amount_paid: 0,
    balance: body.total || 0,
    status: 'pending',
    created_by: session.id,
    created_at: new Date().toISOString(),
    patient_first_name: patient ? patient.first_name : null,
    patient_last_name: patient ? patient.last_name : null,
    patient_number: patient ? patient.patient_number : null,
  }

  db.invoices.push(newInvoice)

  if (body.items && Array.isArray(body.items)) {
    for (const item of body.items) {
      db.invoice_items.push({
        id: generateId('ii'),
        invoice_id: newInvoice.id,
        description: item.description,
        category: item.category || null,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        total: item.total,
      })
    }
  }

  writeDb(db)

  return NextResponse.json(newInvoice, { status: 201 })
}
