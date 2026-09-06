import { cn } from 'cn'
import { STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
  type?: 'status' | 'priority' | 'custom'
  customClass?: string
  className?: string
}

function formatLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function StatusBadge({
  status,
  type = 'status',
  customClass,
  className,
}: StatusBadgeProps) {
  let colorClass = ''

  if (type === 'priority') {
    colorClass = PRIORITY_COLORS[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  } else if (type === 'custom' && customClass) {
    colorClass = customClass
  } else {
    colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        type === 'priority' && 'border',
        colorClass,
        className
      )}
    >
      {formatLabel(status)}
    </span>
  )
}
