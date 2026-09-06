import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import type { MaintenanceRequest } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface MaintenanceSnapshotProps {
  requests: MaintenanceRequest[]
}

export function MaintenanceSnapshot({ requests }: MaintenanceSnapshotProps) {
  const top5 = requests.slice(0, 5)

  if (!top5.length) {
    return (
      <div className="flex flex-col gap-4">
        <p className="py-8 text-center text-sm text-gray-400">
          No open maintenance requests
        </p>
        <Link
          href="/manager/maintenance"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          View all maintenance <ArrowRight size={12} />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      <ul className="divide-y divide-gray-50">
        {top5.map((req) => (
          <li key={req.id} className="flex items-start gap-3 py-3 first:pt-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={req.priority} type="priority" className="shrink-0" />
                <span className="text-xs text-gray-400 shrink-0">Unit {req.unitId.split('_').pop()?.toUpperCase()}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-800 leading-snug line-clamp-1">
                {req.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link
          href="/manager/maintenance"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          View all maintenance requests <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
