import Link from 'next/link'
import { ClipboardCheck, Plus, CheckCircle2, Clock, Calendar } from 'lucide-react'
import { getInspections } from '@/lib/actions/inspection-actions'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Inspection, InspectionStatus } from '@/types'
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

const TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In',
  MOVE_OUT: 'Move-Out',
  PERIODIC: 'Periodic',
}

const TYPE_COLORS: Record<string, string> = {
  MOVE_IN: 'bg-green-100 text-green-800',
  MOVE_OUT: 'bg-orange-100 text-orange-800',
  PERIODIC: 'bg-blue-100 text-blue-800',
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700',
      )}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function fmt(date?: Date | null) {
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ inspections }: { inspections: Inspection[] }) {
  const scheduled = inspections.filter((i) => i.status === InspectionStatus.SCHEDULED).length
  const completed = inspections.filter((i) => i.status === InspectionStatus.COMPLETED).length
  const moveIn = inspections.filter((i) => i.type === 'MOVE_IN').length
  const moveOut = inspections.filter((i) => i.type === 'MOVE_OUT').length

  const stats = [
    { label: 'Scheduled', value: scheduled, icon: Clock, color: 'text-blue-600' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Move-In', value: moveIn, icon: Calendar, color: 'text-indigo-600' },
    { label: 'Move-Out', value: moveOut, icon: Calendar, color: 'text-orange-600' },
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

export default async function InspectionsPage() {
  const result = await getInspections()
  const inspections = result.success ? result.data : []

  // Sort: scheduled first, then by scheduledAt desc
  const sorted = [...inspections].sort((a, b) => {
    const statusOrder = { SCHEDULED: 0, IN_PROGRESS: 1, COMPLETED: 2, CANCELLED: 3 }
    const sd = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4)
    if (sd !== 0) return sd
    return b.scheduledAt.getTime() - a.scheduledAt.getTime()
  })

  return (
    <div>
      <PageHeader
        title="Inspections"
        description="Schedule and track property inspections across all units."
      >
        <Link href="/inspections/new">
          <Button>
            <Plus className="size-4" />
            Schedule Inspection
          </Button>
        </Link>
      </PageHeader>

      <StatsBar inspections={inspections} />

      {inspections.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="size-8" />}
          title="No inspections yet"
          description="Schedule your first inspection to get started."
          action={
            <Link href="/inspections/new">
              <Button>
                <Plus className="size-4" />
                Schedule Inspection
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Property · Unit</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Scheduled Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conducted By</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((insp) => {
                const loc = getUnitLabel(insp.unitId)
                return (
                  <tr key={insp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <TypeBadge type={insp.type} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{loc.property}</div>
                      <div className="text-xs text-muted-foreground">Unit {loc.unit}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={insp.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {fmt(insp.scheduledAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {insp.conductedBy === 'user_manager_001'
                        ? 'Property Manager'
                        : insp.conductedBy}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/inspections/${insp.id}`}>
                          <Button variant="ghost" size="xs">View</Button>
                        </Link>
                        {insp.status === InspectionStatus.SCHEDULED && (
                          <Link href={`/inspections/${insp.id}`}>
                            <Button variant="ghost" size="xs">Start</Button>
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
      )}
    </div>
  )
}
