import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readDb } from '@/lib/mock-db'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

  const db = readDb()

  // Total patients registered up to 'to' date
  const totalPatients = (db.patients as Record<string, unknown>[]).filter(
    (p) => String(p.created_at).split('T')[0] <= to
  ).length

  // Total revenue from payments in range
  const totalRevenue = (db.payments as Record<string, unknown>[])
    .filter((p) => {
      const d = String(p.payment_date)
      return d >= from && d <= to
    })
    .reduce((sum, p) => sum + Number(p.amount), 0)

  // Current admissions
  const bedOccupancy = Math.round(
    (db.admissions.filter((a) => (a as Record<string, unknown>).status === 'admitted').length / 800) * 100
  )

  // Lab turnaround (avg hours for completed tests in range)
  const completedTests = (db.lab_tests as Record<string, unknown>[]).filter(
    (t) =>
      t.status === 'completed' &&
      t.completed_at &&
      String(t.requested_at).split('T')[0] >= from &&
      String(t.requested_at).split('T')[0] <= to
  )
  let avgTurnaround = 0
  if (completedTests.length > 0) {
    const totalHours = completedTests.reduce((sum, t) => {
      const diff = new Date(String(t.completed_at)).getTime() - new Date(String(t.requested_at)).getTime()
      return sum + diff / (1000 * 60 * 60)
    }, 0)
    avgTurnaround = Math.round(totalHours / completedTests.length)
  }

  // Department metrics
  const users = db.users as Record<string, unknown>[]
  const appointments = db.appointments as Record<string, unknown>[]
  const invoices = db.invoices as Record<string, unknown>[]

  const deptMap: Record<string, { patient_count: number; revenue: number }> = {}
  for (const appt of appointments) {
    const d = String(appt.appointment_date)
    if (d < from || d > to) continue
    const doc = users.find((u) => u.id === appt.doctor_id)
    if (!doc) continue
    const dept = String(doc.department || 'Unknown')
    if (!deptMap[dept]) deptMap[dept] = { patient_count: 0, revenue: 0 }
    deptMap[dept].patient_count++
  }
  for (const inv of invoices) {
    const d = String(inv.created_at).split('T')[0]
    if (d < from || d > to) continue
    // Find the appointment for this patient to attribute to department
    const appt = appointments.find((a) => a.patient_id === inv.patient_id)
    if (!appt) continue
    const doc = users.find((u) => u.id === appt.doctor_id)
    if (!doc) continue
    const dept = String(doc.department || 'Unknown')
    if (!deptMap[dept]) deptMap[dept] = { patient_count: 0, revenue: 0 }
    deptMap[dept].revenue += Number(inv.total)
  }
  const departmentMetrics = Object.entries(deptMap)
    .map(([department, data]) => ({ department, ...data, avg_time: 30 }))
    .sort((a, b) => b.patient_count - a.patient_count)

  // Billing summary
  const payments = (db.payments as Record<string, unknown>[]).filter((p) => {
    const d = String(p.payment_date)
    return d >= from && d <= to
  })
  const cashPayments = payments.filter((p) => p.payment_method === 'cash' || p.payment_method === 'mpesa')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const shaSubmitted = payments.filter((p) => p.payment_method === 'sha')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const outstandingBalance = invoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + Number(i.balance), 0)

  // Top medicines by dispensing (use invoice items)
  const invoiceItems = db.invoice_items as Record<string, unknown>[]
  const medMap: Record<string, { quantity: number; total_cost: number }> = {}
  for (const item of invoiceItems) {
    if (String(item.category || '').toLowerCase() === 'pharmacy') {
      const name = String(item.description)
      if (!medMap[name]) medMap[name] = { quantity: 0, total_cost: 0 }
      medMap[name].quantity += Number(item.quantity)
      medMap[name].total_cost += Number(item.total)
    }
  }
  const topMedicines = Object.entries(medMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  return NextResponse.json({
    totalPatients,
    totalRevenue,
    patientsTrend: '+5%',
    revenueTrend: '+12%',
    bedOccupancy,
    avgTurnaround,
    departmentMetrics,
    cashPayments,
    shaSubmitted,
    outstandingBalance,
    topMedicines,
  })
}
