import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'primary' | 'success' | 'warning' | 'destructive'
  subtitle?: string
}

const colorMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

export function StatCard({ title, value, icon: Icon, color = 'primary', subtitle }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 bg-card border border-border p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${colorMap[color]}`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-foreground leading-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
