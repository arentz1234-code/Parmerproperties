import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  Clock,
  User,
  MessageCircle,
  ExternalLink,
} from 'lucide-react'
import { tenants } from '@/lib/mock-data/tenants'
import { leases } from '@/lib/mock-data/leases'
import { inspections } from '@/lib/mock-data/inspections'
import { formatDate } from '@/lib/utils'
import { LeaseStatus, InspectionStatus } from '@/types'
import type { InspectionType } from '@/types'

function inspectionTypeLabel(type: InspectionType) {
  switch (type) {
    case 'MOVE_IN':
      return 'Move-In'
    case 'MOVE_OUT':
      return 'Move-Out'
    case 'PERIODIC':
      return 'Periodic'
    default:
      return type
  }
}

function inspectionTypeColor(type: InspectionType) {
  switch (type) {
    case 'MOVE_IN':
      return 'bg-green-100 text-green-700'
    case 'MOVE_OUT':
      return 'bg-orange-100 text-orange-700'
    case 'PERIODIC':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export default async function TenantInspectionsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id ?? 'user_tenant_001'
  const tenant = tenants.find((t) => t.userId === userId) ?? tenants[0]
  const tenantId = tenant.id

  const activeLease = leases.find(
    (l) => l.tenantId === tenantId && l.status === LeaseStatus.ACTIVE,
  ) ?? leases[0]

  const unitId = activeLease.unitId

  const unitInspections = inspections
    .filter((i) => i.unitId === unitId)
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())

  const upcoming = unitInspections.filter(
    (i) =>
      i.status === InspectionStatus.SCHEDULED ||
      i.status === InspectionStatus.IN_PROGRESS,
  )
  const past = unitInspections.filter(
    (i) =>
      i.status === InspectionStatus.COMPLETED ||
      i.status === InspectionStatus.CANCELLED,
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          View scheduled and past inspections for your unit.
        </p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-amber-500" />
          Upcoming Inspections
        </h2>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
            <CalendarDays size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No upcoming inspections scheduled</p>
            <p className="text-xs text-gray-400 mt-1">
              You'll be notified at least 24 hours before any scheduled inspection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((inspection) => (
              <div
                key={inspection.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <ClipboardList size={18} className="text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inspectionTypeColor(inspection.type)}`}>
                          {inspectionTypeLabel(inspection.type)} Inspection
                        </span>
                        <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                          Scheduled
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-gray-400" />
                        {formatDate(inspection.scheduledAt)} at{' '}
                        {inspection.scheduledAt.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <User size={13} className="text-gray-400" />
                        Conducted by: Andrew Rentz (Property Manager)
                      </p>
                    </div>
                  </div>
                </div>

                {inspection.notes && (
                  <p className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                    {inspection.notes}
                  </p>
                )}

                <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Heads up:</span> You'll receive advance notice before any inspection. You're welcome to be present or provide access as arranged.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#2d9d5c]" />
          Past Inspections
        </h2>

        {past.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
            <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No completed inspections yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {past.map((inspection) => (
              <div
                key={inspection.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inspectionTypeColor(inspection.type)}`}>
                          {inspectionTypeLabel(inspection.type)} Inspection
                        </span>
                        {inspection.status === InspectionStatus.CANCELLED ? (
                          <span className="text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                            Cancelled
                          </span>
                        ) : (
                          <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-gray-400" />
                        {formatDate(inspection.scheduledAt)}
                        {inspection.completedAt && (
                          <span className="text-gray-400 font-normal">
                            — completed {formatDate(inspection.completedAt)}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <User size={13} className="text-gray-400" />
                        Conducted by: Andrew Rentz (Property Manager)
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/mock-docs/inspection-report.pdf"
                    target="_blank"
                    className="shrink-0 flex items-center gap-1.5 text-sm text-[#2d9d5c] font-medium hover:underline"
                  >
                    View Report <ExternalLink size={13} />
                  </Link>
                </div>

                {inspection.notes && (
                  <p className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                    📋 {inspection.notes}
                  </p>
                )}

                {/* Room summary */}
                {Object.keys(inspection.rooms).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Rooms Inspected
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(inspection.rooms).map(([room, data]) => {
                        const roomData = data as { condition?: string }
                        return (
                          <span key={room} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                            {room.replace(/([A-Z])/g, ' $1').trim()} — {roomData?.condition ?? 'OK'}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questions card */}
      <div className="rounded-2xl bg-[#2d9d5c]/5 border border-[#2d9d5c]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-xl bg-[#2d9d5c]/10 flex items-center justify-center shrink-0">
            <MessageCircle size={18} className="text-[#2d9d5c]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Have questions about your inspection?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Reach out to your property manager — we're happy to clarify any findings or answer questions.
            </p>
            <Link
              href="/tenant/messages"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#2d9d5c] hover:underline"
            >
              Send a message <MessageCircle size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
