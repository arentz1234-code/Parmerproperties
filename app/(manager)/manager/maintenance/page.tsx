import Link from 'next/link'
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  CircleDot,
  Wrench,
  Plus,
  LayoutList,
  Columns3,
  MoreHorizontal,
  UserCheck,
} from 'lucide-react'
import { getMaintenanceRequests } from '@/lib/actions/maintenance-actions'
import { getVendors } from '@/lib/actions/vendor-actions'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { MaintenanceKanban } from '@/components/maintenance/maintenance-kanban'
import { MaintenanceViewToggle } from '@/components/maintenance/maintenance-view-toggle'
import {
  MaintenancePriority,
  MaintenanceStatus,
  type MaintenanceRequest,
} from '@/types'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { cn } from 'cn'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUnitLabel(unitId: string) {
  const unit = units.find((u) => u.id === unitId)
  if (!unit) return { unit: unitId, property: '' }
  const property = properties.find((p) => p.id === unit.propertyId)
  return { unit: unit.unitNumber, property: property?.name ?? '' }
}

const PRIORITY_BADGE: Record<MaintenancePriority, string> = {
  EMERGENCY: 'bg-red-100 text-red-800 border border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  LOW: 'bg-gray-100 text-gray-700 border border-gray-200',
}

const PRIORITY_DOT: Record<MaintenancePriority, string> = {
  EMERGENCY: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-gray-400',
}

function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        PRIORITY_BADGE[priority],
      )}
    >
      <span className={cn('size-1.5 rounded-full', PRIORITY_DOT[priority])} />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  )
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: MaintenanceStatus.OPEN },
  { label: 'In Progress', value: MaintenanceStatus.IN_PROGRESS },
  { label: 'Completed', value: MaintenanceStatus.COMPLETED },
  { label: 'Emergency', value: MaintenancePriority.EMERGENCY },
]

// ─── Table ────────────────────────────────────────────────────────────────────

function MaintenanceTable({
  requests,
  vendors,
}: {
  requests: MaintenanceRequest[]
  vendors: { id: string; name: string }[]
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<Wrench className="size-8" />}
        title="No maintenance requests"
        description="Requests will appear here as they come in."
      />
    )
  }

  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]))

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10 bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Priority</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title / Category</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Property · Unit</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vendor</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Created</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((req) => {
            const loc = getUnitLabel(req.unitId)
            const vendorName = req.vendorId ? vendorMap.get(req.vendorId) : null
            const isResolvable =
              req.status === MaintenanceStatus.IN_PROGRESS ||
              req.status === MaintenanceStatus.OPEN ||
              req.status === MaintenanceStatus.PENDING_PARTS
            const isCancellable =
              req.status !== MaintenanceStatus.COMPLETED &&
              req.status !== MaintenanceStatus.CANCELLED

            return (
              <tr key={req.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-4 py-3">
                  <PriorityBadge priority={req.priority} />
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <Link
                    href={`/manager/maintenance/${req.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline line-clamp-1"
                  >
                    {req.title}
                  </Link>
                  <span className="mt-0.5 inline-block text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                    {req.category}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-foreground">{loc.property}</div>
                  <div className="text-xs text-muted-foreground">Unit {loc.unit}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-4 py-3">
                  {vendorName ? (
                    <span className="text-foreground">{vendorName}</span>
                  ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {req.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/manager/maintenance/${req.id}`}>
                      <Button variant="ghost" size="xs">View</Button>
                    </Link>
                    {!req.vendorId && (
                      <Link href={`/maintenance/${req.id}?action=assign`}>
                        <Button variant="ghost" size="xs">
                          <UserCheck className="size-3 mr-1" />
                          Assign
                        </Button>
                      </Link>
                    )}
                    {isResolvable && (
                      <Link href={`/maintenance/${req.id}?action=resolve`}>
                        <Button variant="ghost" size="xs">Resolve</Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ requests }: { requests: MaintenanceRequest[] }) {
  const emergency = requests.filter((r) => r.priority === MaintenancePriority.EMERGENCY).length
  const open = requests.filter((r) => r.status === MaintenanceStatus.OPEN).length
  const inProgress = requests.filter((r) => r.status === MaintenanceStatus.IN_PROGRESS).length
  const completed = requests.filter((r) => r.status === MaintenanceStatus.COMPLETED).length

  const stats = [
    { label: 'Emergency', value: emergency, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Open', value: open, icon: CircleDot, color: 'text-blue-600' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-indigo-600' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-600' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl bg-card ring-1 ring-foreground/10 px-4 py-3">
          <Icon className={cn('size-5 shrink-0', color)} />
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ tab?: string; view?: string }>
}

export default async function MaintenancePage({ searchParams }: Props) {
  const params = await searchParams
  const tab = params.tab ?? 'all'
  const view = params.view ?? 'table'

  const [maintResult, vendorResult] = await Promise.all([
    getMaintenanceRequests(),
    getVendors(),
  ])

  const allRequests = maintResult.success ? maintResult.data : []
  const vendors = vendorResult.success ? vendorResult.data : []

  // Filter by tab
  let filtered = allRequests
  if (tab === MaintenanceStatus.OPEN) {
    filtered = allRequests.filter((r) => r.status === MaintenanceStatus.OPEN)
  } else if (tab === MaintenanceStatus.IN_PROGRESS) {
    filtered = allRequests.filter((r) => r.status === MaintenanceStatus.IN_PROGRESS)
  } else if (tab === MaintenanceStatus.COMPLETED) {
    filtered = allRequests.filter((r) => r.status === MaintenanceStatus.COMPLETED)
  } else if (tab === MaintenancePriority.EMERGENCY) {
    filtered = allRequests.filter((r) => r.priority === MaintenancePriority.EMERGENCY)
  }

  // Sort: emergency first, then by createdAt desc
  const PRIORITY_ORDER = { EMERGENCY: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  filtered = [...filtered].sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (pd !== 0) return pd
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track and manage maintenance requests across all properties."
      >
        <Link href="/manager/maintenance/new">
          <Button>
            <Plus className="size-4" />
            New Request
          </Button>
        </Link>
      </PageHeader>

      <StatsBar requests={allRequests} />

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {TABS.map(({ label, value }) => (
            <Link
              key={value}
              href={`/manager/maintenance?tab=${value}&view=${view}`}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                tab === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {label}
              {value === 'all' && (
                <span className="ml-1.5 text-xs opacity-70">({allRequests.length})</span>
              )}
            </Link>
          ))}
        </div>

        {/* View toggle */}
        <MaintenanceViewToggle view={view} tab={tab} />
      </div>

      {/* Content */}
      {view === 'kanban' ? (
        <MaintenanceKanban requests={filtered} vendors={vendors} />
      ) : (
        <MaintenanceTable requests={filtered} vendors={vendors} />
      )}
    </div>
  )
}
