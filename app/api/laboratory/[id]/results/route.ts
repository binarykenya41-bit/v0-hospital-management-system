import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const body = await request.json()

  const result = await sql`
    UPDATE lab_tests
    SET 
      status = 'completed',
      result_text = ${body.result_text},
      reference_range = ${body.reference_range || null},
      is_abnormal = ${body.is_abnormal || false},
      notes = ${body.notes || null},
      completed_at = NOW(),
      completed_by = ${session.id}
    WHERE id = ${parseInt(params.id)}
    RETURNING *
  `

  if (result.length === 0) {
    return NextResponse.json(
      { error: 'Test not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(result[0])
}
