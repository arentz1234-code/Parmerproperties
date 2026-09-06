import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  Printer,
  Calendar,
  User,
  ClipboardList,
} from 'lucide-react'
import { getInspectionById } from '@/lib/actions/inspection-actions'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InspectionStatus } from '@/types'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { cn } from 'cn'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In Inspection',
  MOVE_OUT: 'Move-Out Inspection',
  PERIODIC: 'Periodic Inspection',
}

const TYPE_COLORS: Record<string, string> = {
  MOVE_IN: 'bg-green-100 text-green-800',
  MOVE_OUT: 'bg-orange-100 text-orange-800',
  PERIODIC: 'bg-blue-100 text-blue-800',
}

function fmt(date?: Date | null) {
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function fmtTime(date?: Date | null) {
  if (!date) return ''
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// ─── Room condition badge ─────────────────────────────────────────────────────

const CONDITION_STYLES: Record<string, string> = {
  Excellent: 'bg-green-100 text-green-800',
  Good: 'bg-blue-100 text-blue-800',
  Fair: 'bg-yellow-100 text-yellow-800',
  Poor: 'bg-red-100 text-red-800',
}

function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        CONDITION_STYLES[condition] ?? 'bg-gray-100 text-gray-700',
      )}
    >
      {condition}
    </span>
  )
}

// ─── Room checklist (completed) ───────────────────────────────────────────────

function RoomChecklistCompleted({
  rooms,
}: {
  rooms: Record<string, unknown>
}) {
  const entries = Object.entries(rooms)
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No room data recorded.</p>
  }

  function formatRoomName(key: string) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim()
  }

  return (
    <div className="divide-y divide-border rounded-xl ring-1 ring-foreground/10 overflow-hidden">
      <div className="grid grid-cols-3 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <span>Room</span>
        <span>Condition</span>
        <span>Notes</span>
      </div>
      {entries.map(([room, data]) => {
        const d = data as { condition?: string; notes?: string }
        return (
          <div key={room} className="grid grid-cols-3 px-4 py-3 text-sm items-start">
            <span className="font-medium text-foreground">{formatRoomName(room)}</span>
            <span>
              {d.condition ? <ConditionBadge condition={d.condition} /> : '—'}
            </span>
            <span className="text-muted-foreground leading-relaxed">
              {d.notes ?? '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Inspection template (scheduled/in-progress) ──────────────────────────────

const DEFAULT_ROOMS = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom 2',
  'Bathroom 1',
  'Bathroom 2',
  'Hallway',
  'Exterior / Entry',
]

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']

function InspectionTemplate() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Use this template to record room conditions during the inspection. Conditions and notes can be saved when the inspection is completed.
      </p>
      <div className="divide-y divide-border rounded-xl ring-1 ring-foreground/10 overflow-hidden">
        <div className="grid grid-cols-3 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Room</span>
          <span>Condition</span>
          <span>Notes</span>
        </div>
        {DEFAULT_ROOMS.map((room) => (
          <div key={room} className="grid grid-cols-3 px-4 py-3 items-start gap-2">
            <span className="text-sm font-medium text-foreground pt-1">{room}</span>
            <div>
              <select
                className="h-7 w-full rounded-lg border border-input bg-transparent px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                defaultValue=""
              >
                <option value="">Select…</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Notes…"
                className="h-7 w-full rounded-lg border border-input bg-transparent px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Button size="sm">Save Progress</Button>
        <Button size="sm" variant="outline">Mark Complete</Button>
      </div>
    </div>
  )
}

// ─── Photo grid ───────────────────────────────────────────────────────────────

function PhotoGrid({ photos }: { photos?: string[] }) {
  const count = photos?.length ?? 0
  const placeholders = Math.max(4, count + 2)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: placeholders }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-xl bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed border-border"
        >
          <ImageIcon className="size-6" />
          <span className="text-xs">
            {i < count ? `Photo ${i + 1}` : 'Add photo'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ inspectionId: string }>
}

export default async function InspectionDetailPage({ params }: Props) {
  const { inspectionId } = await params
  const result = await getInspectionById(inspectionId)
  if (!result.success) notFound()

  const inspection = result.data
  const unit = units.find((u) => u.id === inspection.unitId)
  const property = unit ? properties.find((p) => p.id === unit.propertyId) : null

  const isCompleted = inspection.status === InspectionStatus.COMPLETED
  const isScheduled = inspection.status === InspectionStatus.SCHEDULED
  const typeLabel = TYPE_LABELS[inspection.type] ?? inspection.type

  return (
    <div>
      {/* Back nav */}
      <Link
        href="/inspections"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Inspections
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                TYPE_COLORS[inspection.type] ?? 'bg-gray-100 text-gray-700',
              )}
            >
              {typeLabel}
            </span>
            <StatusBadge status={inspection.status} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {property?.name ?? '—'} · Unit {unit?.unitNumber ?? '—'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {fmt(inspection.scheduledAt)}
              {fmtTime(inspection.scheduledAt) ? ` at ${fmtTime(inspection.scheduledAt)}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {inspection.conductedBy === 'user_manager_001'
                ? 'Property Manager'
                : inspection.conductedBy}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <Button variant="outline">
              <Printer className="size-4" />
              Print / PDF
            </Button>
          )}
          {isScheduled && (
            <Button>
              <ClipboardList className="size-4" />
              Start Inspection
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6">
        {/* Completed summary */}
        {isCompleted && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <CardTitle>Inspection Completed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Completed</p>
                  <p className="font-medium">{fmt(inspection.completedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Rooms Inspected</p>
                  <p className="font-medium">{Object.keys(inspection.rooms).length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Photos</p>
                  <p className="font-medium">{inspection.photos?.length ?? 0}</p>
                </div>
              </div>

              {inspection.notes && (
                <div className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground leading-relaxed mb-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                  {inspection.notes}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Room checklist */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isCompleted ? 'Room-by-Room Results' : 'Inspection Checklist'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCompleted ? (
              <RoomChecklistCompleted rooms={inspection.rooms} />
            ) : (
              <InspectionTemplate />
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Photos</CardTitle>
              <Button variant="outline" size="sm">
                <ImageIcon className="size-3.5" />
                Upload Photo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PhotoGrid photos={inspection.photos} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
