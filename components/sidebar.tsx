'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CalendarDays, FileText,
  Receipt, Pill, FlaskConical, Package, UserCog,
  BarChart3, Building2,
} from 'lucide-react'

interface SidebarProps {
  permissions: string[]
  user: {
    firstName: string
    lastName: string
    role: string
    department: string | null
  }
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'patients', label: 'Patients', href: '/dashboard/patients', icon: Users },
  { key: 'appointments', label: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
  { key: 'emr', label: 'Medical Records', href: '/dashboard/emr', icon: FileText },
  { key: 'billing', label: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { key: 'pharmacy', label: 'Pharmacy', href: '/dashboard/pharmacy', icon: Pill },
  { key: 'laboratory', label: 'Laboratory', href: '/dashboard/laboratory', icon: FlaskConical },
  { key: 'inventory', label: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { key: 'staff', label: 'Staff', href: '/dashboard/staff', icon: UserCog },
  { key: 'reports', label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
]

function formatRole(role: string) {
  return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function Sidebar({ permissions, user }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(item => permissions.includes(item.key))

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center bg-primary">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight truncate">MTRH HMS</p>
          <p className="text-[10px] text-muted-foreground truncate">Hospital Management</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 mx-1 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-accent text-accent-foreground border-l-2 border-l-primary font-medium'
                  : 'text-foreground hover:bg-secondary border-l-2 border-l-transparent'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {formatRole(user.role)}
        </p>
        {user.department && (
          <p className="text-[10px] text-muted-foreground truncate">
            {user.department}
          </p>
        )}
      </div>
    </aside>
  )
}
