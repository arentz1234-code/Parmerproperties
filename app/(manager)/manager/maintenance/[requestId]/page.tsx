import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  User,
  Wrench,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { getMaintenanceById } from '@/lib/actions/maintenance-actions'
import { getVendors } from '@/lib/actions/vendor-actions'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { AssignVendorDialog } from '@/components/maintenance/assign-vendor-dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  MaintenancePriority,
  MaintenanceStatus,
} from '@/types'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { tenants } from '@/lib/mock-data/tenants'
import { cn } from 'cn'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_BADGE: Record<MaintenancePriority, string> = {
  EMERGENCY: 'bg-red-100 text-red-800 border border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  LOW: 'bg-gray-100 text-gray-700 border border-gray-200',
}

function fmt(date?: Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return '—'
  return date.toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateTime(date?: Date | null) {
  if (!date) return '—'
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}

// ─── Photo grid placeholder ───────────────────────────────────────────────────

function PhotoGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-xl bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed border-border"
        >
          <ImageIcon className="size-6" />
          <span className="text-xs">Photo {i + 1}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Notes timeline ──────────────────────────────────────────────────────────

function NotesTimeline({
  notes,
  createdAt,
  scheduledAt,
  completedAt,
}: {
  notes?: string
  createdAt: Date
  scheduledAt?: Date
  completedAt?: Date
}) {
  const items: { icon: React.ReactNode; label: string; date: Date; note?: string }[] = [
    {
      icon: <FileText className="size-3.5" />,
      label: 'Request submitted',
      date: createdAt,
    },
  ]
  if (scheduledAt) {
    items.push({
      icon: <Calendar className="size-3.5" />,
      label: 'Vendor scheduled',
      date: scheduledAt,
    })
  }
  if (completedAt) {
    items.push({
      icon: <CheckCircle2 className="size-3.5 text-green-600" />,
      label: 'Work completed',
      date: completedAt,
    })
  }
  if (notes) {
    items.push({
      icon: <MessageSquare className="size-3.5" />,
      label: 'Note',
      date: createdAt,
      note: notes,
    })
  }

  return (
    <div className="relative space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {item.icon}
            </div>
            {idx < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-4 min-w-0">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{fmtDateTime(item.date)}</p>
            {item.note && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed rounded-lg bg-muted px-3 py-2">
                {item.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ requestId: string }>
  searchParams: Promise<{ action?: string }>
}

export default async function MaintenanceDetailPage({ params, searchParams }: Props) {
  const { requestId } = await params
  const sp = await searchParams

  const [result, vendorResult] = await Promise.all([
    getMaintenanceById(requestId),
    getVendors(),
  ])

  if (!result.success) notFound()

  const req = result.data
  const vendors = vendorResult.success ? vendorResult.data : []

  // Enrich data
  const unit = units.find((u) => u.id === req.unitId)
  const property = unit ? properties.find((p) => p.id === unit.propertyId) : null
  const submittedByTenant = tenants.find((t) => t.userId === req.requestedBy || t.id === req.requestedBy)
  const submittedByLabel = submittedByTenant
    ? `${submittedByTenant.firstName} ${submittedByTenant.lastName}`
    : req.requestedBy === 'user_manager_001'
    ? 'Property Manager'
    : req.requestedBy

  const isResolvable =
    req.status === MaintenanceStatus.IN_PROGRESS ||
    req.status === MaintenanceStatus.OPEN ||
    req.status === MaintenanceStatus.PENDING_PARTS
  const isCancellable =
    req.status !== MaintenanceStatus.COMPLETED &&
    req.status !== MaintenanceStatus.CANCELLED

  const openAssign = sp.action === 'assign'
  const openResolve = sp.action === 'resolve'

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/manager/maintenance"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Maintenance
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                  PRIORITY_BADGE[req.priority],
                )}
              >
                {req.priority.charAt(0) + req.priority.slice(1).toLowerCase()} Priority
              </span>
              <StatusBadge status={req.status} />
              <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">
                {req.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-snug">{req.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">#{req.id}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!req.vendorId && (
              <AssignVendorDialog
                requestId={req.id}
                vendors={vendors}
                defaultOpen={openAssign}
              />
            )}
            {isResolvable && (
              <Link href={`/manager/maintenance/${req.id}?action=resolve`}>
                <Button variant="outline">
                  <CheckCircle2 className="size-4" />
                  Resolve
                </Button>
              </Link>
            )}
            {isCancellable && (
              <Button variant="destructive">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{req.description}</p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoRow label="Property">
                  {property ? (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      {property.name}
                    </span>
                  ) : '—'}
                </InfoRow>
                <InfoRow label="Unit">
                  Unit {unit?.unitNumber ?? '—'}
                </InfoRow>
                <InfoRow label="Category">{req.category}</InfoRow>
                <InfoRow label="Submitted By">{submittedByLabel}</InfoRow>
                <InfoRow label="Created">{fmt(req.createdAt)}</InfoRow>
                {req.scheduledAt && (
                  <InfoRow label="Scheduled">
                    {fmtDateTime(req.scheduledAt)}
                  </InfoRow>
                )}
                {req.completedAt && (
                  <InfoRow label="Completed">{fmt(req.completedAt)}</InfoRow>
                )}
              </dl>
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
              <PhotoGrid />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Vendor assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-4 text-muted-foreground" />
                Vendor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {req.vendor ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-foreground">{req.vendor.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{req.vendor.trade}</p>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">{req.vendor.contactName}</p>
                    <p className="text-muted-foreground">{req.vendor.phone}</p>
                    {req.vendor.email && (
                      <p className="text-muted-foreground">{req.vendor.email}</p>
                    )}
                  </div>
                  {req.scheduledAt && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">{fmtDateTime(req.scheduledAt)}</span>
                    </div>
                  )}
                  <AssignVendorDialog
                    requestId={req.id}
                    vendors={vendors}
                    label="Reassign Vendor"
                    variant="outline"
                  />
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-sm text-muted-foreground">No vendor assigned yet.</p>
                  <AssignVendorDialog
                    requestId={req.id}
                    vendors={vendors}
                    defaultOpen={openAssign}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="size-4 text-muted-foreground" />
                Cost Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated</span>
                  <span className="text-sm font-medium">
                    {req.estimatedCost != null
                      ? `$${req.estimatedCost.toLocaleString()}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actual</span>
                  <span className="text-sm font-medium">
                    {req.actualCost != null
                      ? `$${req.actualCost.toLocaleString()}`
                      : '—'}
                  </span>
                </div>
                {req.estimatedCost != null && req.actualCost != null && (
                  <>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Variance</span>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          req.actualCost > req.estimatedCost
                            ? 'text-destructive'
                            : 'text-green-600',
                        )}
                      >
                        {req.actualCost > req.estimatedCost ? '+' : ''}
                        ${(req.actualCost - req.estimatedCost).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes / Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotesTimeline
                notes={req.notes}
                createdAt={req.createdAt}
                scheduledAt={req.scheduledAt}
                completedAt={req.completedAt}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
