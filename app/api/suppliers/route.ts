import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  const db = readDb()
  let suppliers = (db.suppliers as Record<string, unknown>[]).filter((s) => s.is_active)

  if (search) {
    const q = search.toLowerCase()
    suppliers = suppliers.filter(
      (s) =>
        String(s.name).toLowerCase().includes(q) ||
        String(s.contact_person || '').toLowerCase().includes(q)
    )
  }

  suppliers.sort((a, b) => String(a.name).localeCompare(String(b.name)))

  return NextResponse.json({ suppliers })
}
