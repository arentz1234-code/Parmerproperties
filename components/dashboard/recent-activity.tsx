'use client'

import { cn } from 'cn'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityItem } from '@/lib/mock-data'

interface RecentActivityProps {
  items: ActivityItem[]
}

const CATEGORY_STYLES: Record<
  ActivityItem['type'],
  { dot: string; label: string }
> = {
  payment_received: {
    dot: 'bg-green-500',
    label: 'Payment',
  },
  payment_overdue: {
    dot: 'bg-red-500',
    label: 'Overdue',
  },
  maintenance_submitted: {
    dot: 'bg-orange-500',
    label: 'Maintenance',
  },
  maintenance_completed: {
    dot: 'bg-blue-500',
    label: 'Maintenance',
  },
  lease_signed: {
    dot: 'bg-blue-500',
    label: 'Lease',
  },
  application_submitted: {
    dot: 'bg-purple-500',
    label: 'Application',
  },
  inspection_completed: {
    dot: 'bg-gray-400',
    label: 'Inspection',
  },
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No recent activity</p>
    )
  }

  return (
    <ul className="flex flex-col gap-0 divide-y divide-gray-50">
      {items.map((item) => {
        const style = CATEGORY_STYLES[item.type] ?? {
          dot: 'bg-gray-400',
          label: 'Event',
        }

        return (
          <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0">
            {/* Colored dot */}
            <span
              className={cn(
                'mt-1.5 size-2 shrink-0 rounded-full',
                style.dot
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800 leading-snug">{item.description}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
