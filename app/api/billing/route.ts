import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  const sql = getDb()

  const invoices = await sql`
    SELECT i.*, 
      p.first_name as patient_first_name, p.last_name as patient_last_name, p.patient_number
    FROM invoices i
    JOIN patients p ON i.patient_id = p.id
    WHERE i.deleted_at IS NULL
    ${status ? sql`AND i.status = ${status}` : sql``}
    ORDER BY i.created_at DESC
    LIMIT 50
  `

  return NextResponse.json({ invoices })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const body = await request.json()

  // Generate invoice number
  const lastInvoice = await sql`SELECT invoice_number FROM invoices ORDER BY created_at DESC LIMIT 1`
  let nextNum = 1
  if (lastInvoice.length > 0) {
    const parts = lastInvoice[0].invoice_number.split('-')
    nextNum = parseInt(parts[parts.length - 1]) + 1
  }
  const invoiceNumber = `INV-2026-${String(nextNum).padStart(5, '0')}`

  const result = await sql`
    INSERT INTO invoices (
      invoice_number, patient_id, billing_type, sha_number,
      insurance_provider, insurance_number, subtotal, total, balance,
      status, created_by
    ) VALUES (
      ${invoiceNumber}, ${body.patient_id}, ${body.billing_type || 'Cash'},
      ${body.sha_number || null}, ${body.insurance_provider || null},
      ${body.insurance_number || null}, ${body.subtotal || 0}, ${body.total || 0},
      ${body.total || 0}, 'pending', ${session.id}
    ) RETURNING *
  `

  // Insert items if provided
  if (body.items && Array.isArray(body.items)) {
    for (const item of body.items) {
      await sql`
        INSERT INTO invoice_items (invoice_id, description, category, quantity, unit_price, total)
        VALUES (${result[0].id}, ${item.description}, ${item.category || null}, 
                ${item.quantity || 1}, ${item.unit_price}, ${item.total})
      `
    }
  }

  return NextResponse.json(result[0], { status: 201 })
}
