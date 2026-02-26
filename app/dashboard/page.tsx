'use client'

import useSWR from 'swr'
import {
  Users, CalendarDays, BedDouble, AlertTriangle,
  FlaskConical, DollarSign,
} from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { PageHeader } from '@/components/page-header'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const { data, isLoading } = useSWR('/api/dashboard/stats', fetcher, { refreshInterval: 30000 })

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Hospital overview and key metrics"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[88px] bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Patients"
            value={data?.totalPatients ?? 0}
            icon={Users}
            color="primary"
            subtitle="Registered patients"
          />
          <StatCard
            title="Today's Appointments"
            value={data?.todayAppointments ?? 0}
            icon={CalendarDays}
            color="primary"
            subtitle="Scheduled for today"
          />
          <StatCard
            title="Current Admissions"
            value={data?.currentAdmissions ?? 0}
            icon={BedDouble}
            color="success"
            subtitle="Patients admitted"
          />
          <StatCard
            title="Low Stock Medicines"
            value={data?.lowStockMedicines ?? 0}
            icon={AlertTriangle}
            color="warning"
            subtitle="Below reorder level"
          />
          <StatCard
            title="Pending Lab Tests"
            value={data?.pendingLabTests ?? 0}
            icon={FlaskConical}
            color="destructive"
            subtitle="Awaiting results"
          />
          <StatCard
            title="Today's Revenue"
            value={`KES ${(data?.todayRevenue ?? 0).toLocaleString()}`}
            icon={DollarSign}
            color="success"
            subtitle="Payments collected"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-card border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Register Patient', href: '/dashboard/patients?action=new' },
              { label: 'New Appointment', href: '/dashboard/appointments?action=new' },
              { label: 'Lab Request', href: '/dashboard/laboratory?action=new' },
              { label: 'Create Invoice', href: '/dashboard/billing?action=new' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex h-9 items-center justify-center border border-border text-sm text-foreground hover:bg-secondary"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">System Information</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hospital</span>
              <span className="text-foreground font-medium">Moi Teaching & Referral Hospital</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="text-foreground">Eldoret, Uasin Gishu County</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacity</span>
              <span className="text-foreground">800 beds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Version</span>
              <span className="text-foreground font-mono text-xs">HMS v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
