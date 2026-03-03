import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const suppliers = await sql`
      SELECT id, name, contact_person, phone, email, county, supplier_type, is_active
      FROM suppliers
      WHERE is_active = true
        AND (name ILIKE ${'%' + search + '%'} OR contact_person ILIKE ${'%' + search + '%'})
      ORDER BY name ASC
    `

    return Response.json({ suppliers })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return Response.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}
