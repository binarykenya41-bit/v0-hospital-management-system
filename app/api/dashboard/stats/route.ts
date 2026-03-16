import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb } from '@/lib/mock-db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = readDb()
  const today = new Date().toISOString().split('T')[0]

  const totalPatients = db.patients.length
  const todayAppointments = db.appointments.filter(
    (a) => (a as Record<string, unknown>).appointment_date === today
  ).length
  const currentAdmissions = db.admissions.filter(
    (a) => (a as Record<string, unknown>).status === 'admitted'
  ).length
  const lowStockMedicines = db.medicines.filter((m) => {
    const med = m as Record<string, unknown>
    return Number(med.quantity_in_stock) <= Number(med.reorder_level) && med.is_active
  }).length
  const pendingLabTests = db.lab_tests.filter(
    (t) => (t as Record<string, unknown>).status === 'pending'
  ).length

  const todayPayments = db.payments.filter(
    (p) => (p as Record<string, unknown>).payment_date === today
  )
  const todayRevenue = todayPayments.reduce(
    (sum, p) => sum + Number((p as Record<string, unknown>).amount),
    0
  )

  return NextResponse.json({
    totalPatients,
    todayAppointments,
    currentAdmissions,
    lowStockMedicines,
    pendingLabTests,
    todayRevenue,
  })
}
