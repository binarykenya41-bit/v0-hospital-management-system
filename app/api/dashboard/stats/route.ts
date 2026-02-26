import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()

  const [patients, todayAppointments, admissions, medicines, labTests, revenue] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL`,
    sql`SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURRENT_DATE AND deleted_at IS NULL`,
    sql`SELECT COUNT(*) as count FROM admissions WHERE status = 'admitted' AND deleted_at IS NULL`,
    sql`SELECT COUNT(*) as count FROM medicines WHERE quantity_in_stock <= reorder_level AND is_active = true AND deleted_at IS NULL`,
    sql`SELECT COUNT(*) as count FROM lab_tests WHERE status = 'pending' AND deleted_at IS NULL`,
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_date >= CURRENT_DATE`,
  ])

  return NextResponse.json({
    totalPatients: Number(patients[0].count),
    todayAppointments: Number(todayAppointments[0].count),
    currentAdmissions: Number(admissions[0].count),
    lowStockMedicines: Number(medicines[0].count),
    pendingLabTests: Number(labTests[0].count),
    todayRevenue: Number(revenue[0].total),
  })
}
