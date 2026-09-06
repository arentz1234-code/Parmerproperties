import Link from 'next/link'
import { AlertCircle, Clock, Package, CheckCircle2 } from 'lucide-react'
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority, Vendor } from '@/types'
import { StatusBadge } from '@/components/shared/status-badge'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { cn } from 'cn'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUnitLabel(unitId: string) {
  const unit = units.find((u) => u.id === unitId)
  if (!unit) return unitId
  const property = properties.find((p) => p.id === unit.propertyId)
  return `${property?.name ?? ''} · Unit ${unit.unitNumber}`
}

const PRIORITY_DOT: Record<MaintenancePriority, string> = {
  EMERGENCY: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-gray-400',
}

function KanbanCard({
  req,
  vendorMap,
}: {
  req: MaintenanceRequest
  vendorMap: Map<string, string>
}) {
  const vendor = req.vendorId ? vendorMap.get(req.vendorId) : null
  const isEmergency = req.priority === MaintenancePriority.EMERGENCY

  return (
    <Link href={`/maintenance/${req.id}`}>
      <div
        className={cn(
          'group block rounded-xl bg-card ring-1 ring-foreground/10 p-3.5 hover:ring-primary/30 hover:shadow-md transition-all cursor-pointer',
          isEmergency && 'ring-red-300 bg-red-50/30',
        )}
      >
        {/* Priority + category */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn('size-2 rounded-full shrink-0', PRIORITY_DOT[req.priority])}
            />
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {req.priority.toLowerCase()}
            </span>
          </div>
          <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
            {req.category}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">{req.title}</p>

        {/* Location */}
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2.5">
          {getUnitLabel(req.unitId)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
          {vendor ? (
            <span className="text-xs text-foreground/70 truncate">{vendor}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Unassigned</span>
          )}
          <span className="text-xs text-muted-foreground shrink-0">
            {req.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

const COLUMNS: {
  id: MaintenanceStatus
  label: string
  icon: React.ReactNode
  accent: string
}[] = [
  {
    id: MaintenanceStatus.OPEN,
    label: 'Open',
    icon: <AlertCircle className="size-4 text-blue-600" />,
    accent: 'border-blue-300 bg-blue-50/50',
  },
  {
    id: MaintenanceStatus.IN_PROGRESS,
    label: 'In Progress',
    icon: <Clock className="size-4 text-indigo-600" />,
    accent: 'border-indigo-300 bg-indigo-50/50',
  },
  {
    id: MaintenanceStatus.PENDING_PARTS,
    label: 'Pending Parts',
    icon: <Package className="size-4 text-orange-600" />,
    accent: 'border-orange-300 bg-orange-50/50',
  },
  {
    id: MaintenanceStatus.COMPLETED,
    label: 'Completed',
    icon: <CheckCircle2 className="size-4 text-green-600" />,
    accent: 'border-green-300 bg-green-50/50',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  requests: MaintenanceRequest[]
  vendors: Vendor[]
}

export function MaintenanceKanban({ requests, vendors }: Props) {
  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map(({ id, label, icon, accent }) => {
        const cards = requests.filter((r) => r.status === id)
        return (
          <div key={id} className="flex flex-col gap-3">
            {/* Column header */}
            <div
              className={cn(
                'flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5',
                accent,
              )}
            >
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                {cards.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2.5">
              {cards.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  No requests
                </div>
              ) : (
                cards.map((req) => (
                  <KanbanCard key={req.id} req={req} vendorMap={vendorMap} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
