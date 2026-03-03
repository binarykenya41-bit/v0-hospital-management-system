'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Download, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading } = useSWR(
    `/api/reports?from=${dateFrom}&to=${dateTo}`,
    fetcher
  )

  async function handleDownloadReport(type: string) {
    window.open(
      `/api/reports/export?type=${type}&from=${dateFrom}&to=${dateTo}`,
      '_blank'
    )
  }

  const inputClass = "h-8 border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="View hospital statistics, billing reports, and performance metrics"
      />

      {/* Date Range Filter */}
      <div className="bg-card border border-border p-4">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-foreground mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`w-48 ${inputClass}`}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-foreground mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`w-48 ${inputClass}`}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={data?.totalPatients || 0}
              subtitle="Registered patients"
              trend={data?.patientsTrend}
            />
            <StatCard
              title="Total Revenue"
              value={`KES ${Number(data?.totalRevenue || 0).toLocaleString()}`}
              subtitle="Billing period"
              trend={data?.revenueTrend}
            />
            <StatCard
              title="Bed Occupancy"
              value={`${data?.bedOccupancy || 0}%`}
              subtitle="Current occupancy rate"
            />
            <StatCard
              title="Avg. Turnaround"
              value={`${data?.avgTurnaround || 0}h`}
              subtitle="Lab results (hours)"
            />
          </div>

          {/* Department Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Department Performance</h3>
            <div className="border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wide">Department</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wide">Patients Seen</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wide">Revenue (KES)</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wide">Avg. Appointment Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.departmentMetrics?.map((dept: Record<string, unknown>, i: number) => (
                      <tr key={i} className="border-b border-border last:border-b-0 hover:bg-secondary/50">
                        <td className="px-3 py-2 text-foreground">{dept.department}</td>
                        <td className="px-3 py-2 text-foreground">{dept.patient_count}</td>
                        <td className="px-3 py-2 text-foreground">{Number(dept.revenue).toLocaleString()}</td>
                        <td className="px-3 py-2 text-foreground">{dept.avg_time}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Billing Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Cash Payments</p>
                <p className="text-lg font-semibold text-foreground">KES {Number(data?.cashPayments || 0).toLocaleString()}</p>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">SHA Claims Submitted</p>
                <p className="text-lg font-semibold text-foreground">KES {Number(data?.shaSubmitted || 0).toLocaleString()}</p>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Outstanding Balance</p>
                <p className="text-lg font-semibold text-destructive">KES {Number(data?.outstandingBalance || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Medicine Movement */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Top Medicines Used</h3>
            <div className="border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wide">Medicine</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wide">Qty Dispensed</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wide">Cost (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.topMedicines?.map((med: Record<string, unknown>, i: number) => (
                      <tr key={i} className="border-b border-border last:border-b-0 hover:bg-secondary/50">
                        <td className="px-3 py-2 text-foreground">{med.name}</td>
                        <td className="px-3 py-2 text-foreground">{med.quantity}</td>
                        <td className="px-3 py-2 text-foreground">{Number(med.total_cost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Export Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleDownloadReport('revenue')}
                className="flex items-center justify-center gap-2 h-10 border border-primary bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Revenue Report
              </button>
              <button
                onClick={() => handleDownloadReport('billing')}
                className="flex items-center justify-center gap-2 h-10 border border-primary bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Billing Report
              </button>
              <button
                onClick={() => handleDownloadReport('pharmacy')}
                className="flex items-center justify-center gap-2 h-10 border border-primary bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Pharmacy Movement
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
