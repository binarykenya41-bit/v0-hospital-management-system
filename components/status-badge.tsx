const statusStyles: Record<string, string> = {
  scheduled: 'bg-[#EFF6FC] text-[#0078D4]',
  'checked-in': 'bg-[#DFF6DD] text-[#107C10]',
  'in-progress': 'bg-[#FFF4CE] text-[#FF8C00]',
  completed: 'bg-[#DFF6DD] text-[#107C10]',
  cancelled: 'bg-[#FDE7E9] text-[#D13438]',
  'no-show': 'bg-[#FDE7E9] text-[#D13438]',
  pending: 'bg-[#FFF4CE] text-[#FF8C00]',
  admitted: 'bg-[#EFF6FC] text-[#0078D4]',
  discharged: 'bg-[#DFF6DD] text-[#107C10]',
  paid: 'bg-[#DFF6DD] text-[#107C10]',
  partial: 'bg-[#FFF4CE] text-[#FF8C00]',
  overdue: 'bg-[#FDE7E9] text-[#D13438]',
  submitted: 'bg-[#EFF6FC] text-[#0078D4]',
  approved: 'bg-[#DFF6DD] text-[#107C10]',
  rejected: 'bg-[#FDE7E9] text-[#D13438]',
  prescribed: 'bg-[#EFF6FC] text-[#0078D4]',
  dispensed: 'bg-[#DFF6DD] text-[#107C10]',
  routine: 'bg-[#F3F2F1] text-[#605E5C]',
  urgent: 'bg-[#FFF4CE] text-[#FF8C00]',
  emergency: 'bg-[#FDE7E9] text-[#D13438]',
  active: 'bg-[#DFF6DD] text-[#107C10]',
  inactive: 'bg-[#F3F2F1] text-[#605E5C]',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || 'bg-secondary text-secondary-foreground'
  const label = status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}
