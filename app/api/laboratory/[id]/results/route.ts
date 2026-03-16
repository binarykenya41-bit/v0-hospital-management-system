import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb, writeDb } from '@/lib/mock-db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = readDb()
  const body = await request.json()

  const idx = db.lab_tests.findIndex((t) => (t as Record<string, unknown>).id === id)
  if (idx === -1) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 })
  }

  const updated = {
    ...(db.lab_tests[idx] as Record<string, unknown>),
    status: 'completed',
    result_text: body.result_text,
    reference_range: body.reference_range || null,
    is_abnormal: body.is_abnormal || false,
    notes: body.notes || null,
    completed_at: new Date().toISOString(),
    completed_by: session.id,
  }

  db.lab_tests[idx] = updated
  writeDb(db)

  return NextResponse.json(updated)
}
