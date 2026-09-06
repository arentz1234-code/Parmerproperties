'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar, User } from 'lucide-react'
import { cn } from 'cn'
import { formatDate } from '@/lib/utils'
import { MaintenancePriority, MaintenanceStatus } from '@/types'

interface Vendor {
  id: string
  name: string
  contactName: string
  phone: string
}

interface Request {
  id: string
  title: string
  description: string
  priority: string
  status: string
  category: string
  scheduledAt?: Date
  completedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  vendor?: Vendor
}

function getPriorityDot(priority: string) {
  if (priority === MaintenancePriority.EMERGENCY) return 'bg-red-500'
  if (priority === MaintenancePriority.HIGH) return 'bg-orange-500'
  if (priority === MaintenancePriority.MEDIUM) return 'bg-yellow-400'
  return 'bg-gray-300'
}

function getPriorityLabel(priority: string) {
  if (priority === MaintenancePriority.EMERGENCY) return 'Emergency'
  if (priority === MaintenancePriority.HIGH) return 'High'
  if (priority === MaintenancePriority.MEDIUM) return 'Medium'
  return 'Low'
}

function getStatusStyle(status: string) {
  if (status === MaintenanceStatus.OPEN) return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
  if (status === MaintenanceStatus.IN_PROGRESS) return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
  if (status === MaintenanceStatus.PENDING_PARTS) return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
  if (status === MaintenanceStatus.COMPLETED) return 'bg-green-50 text-green-700 ring-1 ring-green-200'
  return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
}

function getStatusLabel(status: string) {
  if (status === MaintenanceStatus.OPEN) return 'Open'
  if (status === MaintenanceStatus.IN_PROGRESS) return 'In Progress'
  if (status === MaintenanceStatus.PENDING_PARTS) return 'Pending Parts'
  if (status === MaintenanceStatus.COMPLETED) return 'Completed'
  if (status === MaintenanceStatus.CANCELLED) return 'Cancelled'
  return status
}

function RequestCard({ request }: { request: Request }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Priority dot */}
        <div className={cn('shrink-0 size-2.5 rounded-full', getPriorityDot(request.priority))} />

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{request.title}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">
              Submitted {formatDate(request.createdAt)}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {request.category}
            </span>
          </div>
        </div>

        {/* Status + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getStatusStyle(request.status))}>
            {getStatusLabel(request.status)}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Priority</p>
              <div className="flex items-center gap-1.5">
                <div className={cn('size-2 rounded-full', getPriorityDot(request.priority))} />
                <span className="text-sm text-gray-700">{getPriorityLabel(request.priority)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Updated</p>
              <p className="text-sm text-gray-700">{formatDate(request.updatedAt)}</p>
            </div>
            {request.scheduledAt && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Scheduled</p>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  <p className="text-sm text-gray-700">{formatDate(request.scheduledAt)}</p>
                </div>
              </div>
            )}
            {request.completedAt && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Completed</p>
                <p className="text-sm text-gray-700">{formatDate(request.completedAt)}</p>
              </div>
            )}
          </div>

          {/* Vendor */}
          {request.vendor && (
            <div className="rounded-xl bg-gray-50 p-3.5 flex items-center gap-3">
              <div className="size-8 rounded-full bg-[#2d9d5c]/10 flex items-center justify-center shrink-0">
                <User size={15} className="text-[#2d9d5c]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Vendor</p>
                <p className="text-sm font-medium text-gray-800">{request.vendor.name}</p>
                <p className="text-xs text-gray-500">{request.vendor.phone}</p>
              </div>
            </div>
          )}

          {/* Manager notes */}
          {request.notes && (
            <div className="rounded-xl bg-[#2d9d5c]/5 border border-[#2d9d5c]/20 p-3.5">
              <p className="text-xs font-semibold text-[#2d9d5c] uppercase tracking-wide mb-1">Manager Update</p>
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TenantMaintenanceList({ requests }: { requests: Request[] }) {
  const active = requests.filter(
    (r) => r.status !== MaintenanceStatus.COMPLETED && r.status !== MaintenanceStatus.CANCELLED,
  )
  const resolved = requests.filter(
    (r) => r.status === MaintenanceStatus.COMPLETED || r.status === MaintenanceStatus.CANCELLED,
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Active */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Active ({active.length})
          </h2>
          <div className="flex flex-col gap-3">
            {active.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Resolved ({resolved.length})
          </h2>
          <div className="flex flex-col gap-3">
            {resolved.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
