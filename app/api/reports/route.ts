import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

    // Total patients
    const totalPatientsResult = await sql`
      SELECT COUNT(*) as count FROM patients WHERE registration_date::date <= ${to}
    `
    const totalPatients = Number(totalPatientsResult[0].count)

    // Total revenue
    const revenueResult = await sql`
      SELECT COALESCE(SUM(total), 0) as total FROM invoices 
      WHERE created_at::date BETWEEN ${from}::date AND ${to}::date
    `
    const totalRevenue = revenueResult[0].total

    // Bed occupancy
    const bedResult = await sql`
      SELECT 
        COALESCE(COUNT(DISTINCT bed_number), 0)::float / NULLIF(
          (SELECT COUNT(DISTINCT bed_number) FROM admissions), 0
        ) * 100 as occupancy
      FROM admissions
      WHERE status = 'admitted' 
        AND admission_date::date BETWEEN ${from}::date AND ${to}::date
    `
    const bedOccupancy = Math.round(Number(bedResult[0].occupancy) || 0)

    // Lab turnaround
    const labResult = await sql`
      SELECT EXTRACT(EPOCH FROM AVG(completed_at - requested_at)) / 3600 as hours
      FROM lab_tests
      WHERE status = 'completed' 
        AND requested_at::date BETWEEN ${from}::date AND ${to}::date
    `
    const avgTurnaround = Math.round(Number(labResult[0].hours) || 0)

    // Department metrics
    const deptMetrics = await sql`
      SELECT 
        u.department,
        COUNT(DISTINCT a.patient_id) as patient_count,
        COALESCE(SUM(i.total), 0) as revenue,
        EXTRACT(EPOCH FROM AVG(a.appointment_date - a.appointment_date))::int / 60 as avg_time
      FROM users u
      LEFT JOIN appointments a ON u.id = a.doctor_id
      LEFT JOIN invoices i ON a.patient_id = i.patient_id
      WHERE u.role_id IN (3, 4)
        AND a.appointment_date::date BETWEEN ${from}::date AND ${to}::date
      GROUP BY u.department
      ORDER BY patient_count DESC
    `

    // Billing summary
    const cashResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments
      WHERE payment_method = 'cash' 
        AND payment_date::date BETWEEN ${from}::date AND ${to}::date
    `
    const shaResult = await sql`
      SELECT COALESCE(SUM(claim_amount), 0) as total FROM sha_claims
      WHERE submission_date::date BETWEEN ${from}::date AND ${to}::date
    `
    const balanceResult = await sql`
      SELECT COALESCE(SUM(balance), 0) as total FROM invoices
      WHERE status != 'paid'
    `

    // Top medicines
    const topMeds = await sql`
      SELECT 
        m.name,
        SUM(pr.quantity)::int as quantity,
        SUM(pr.quantity * m.unit_price) as total_cost
      FROM prescriptions pr
      JOIN medicines m ON pr.medicine_id = m.id
      WHERE pr.created_at::date BETWEEN ${from}::date AND ${to}::date
      GROUP BY m.id, m.name
      ORDER BY quantity DESC
      LIMIT 10
    `

    return Response.json({
      totalPatients,
      totalRevenue,
      patientsTrend: '+5%',
      revenueTrend: '+12%',
      bedOccupancy,
      avgTurnaround,
      departmentMetrics: deptMetrics,
      cashPayments: cashResult[0].total,
      shaSubmitted: shaResult[0].total,
      outstandingBalance: balanceResult[0].total,
      topMedicines: topMeds,
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return Response.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
