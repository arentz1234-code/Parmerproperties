import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Pencil,
  User,
  Home,
  DollarSign,
  Calendar,
  PawPrint,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLeaseById } from '@/lib/actions/lease-actions'
import { getPayments } from '@/lib/actions/payment-actions'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { tenants } from '@/lib/mock-data/tenants'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  iconColor,
  children,
}: {
  icon: React.ElementType
  title: string
  iconColor: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Icon size={14} className={iconColor} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ leaseId: string }>
}) {
  const { leaseId } = await params

  const [leaseResult, paymentsResult] = await Promise.all([
    getLeaseById(leaseId),
    getPayments({ leaseId }),
  ])

  if (!leaseResult.success) notFound()

  const lease = leaseResult.data
  const payments = paymentsResult.success ? paymentsResult.data : []

  const unit = units.find((u) => u.id === lease.unitId)
  const property = unit ? properties.find((p) => p.id === unit.propertyId) : undefined
  const tenant = tenants.find((t) => t.id === lease.tenantId)

  const daysLeft = getDaysUntil(lease.endDate)

  // Last 3 payments sorted by due date desc
  const recentPayments = [...payments]
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
    .slice(0, 3)

  return (
    <div>
      <PageHeader
        title={`Lease #${leaseId.slice(-6).toUpperCase()}`}
        description={
          tenant
            ? `${tenant.firstName} ${tenant.lastName} — ${property?.name ?? ''} Unit ${unit?.unitNumber ?? ''}`
            : undefined
        }
      >
        <Link href="/manager/leases" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft size={14} />
          All Leases
        </Link>
        <StatusBadge status={lease.status} className="text-sm px-3 py-1" />
        <Link href={`/manager/leases/${leaseId}/edit`} className={buttonVariants({})}>
          <Pencil size={14} />
          Edit Lease
        </Link>
      </PageHeader>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          {/* Tenant Info */}
          <SectionCard icon={User} title="Tenant" iconColor="text-blue-500">
            {tenant ? (
              <>
                <InfoRow label="Name" value={`${tenant.firstName} ${tenant.lastName}`} />
                <InfoRow
                  label="Email"
                  value={
                    <a href={`mailto:${tenant.email}`} className="text-blue-600 hover:underline">
                      {tenant.email}
                    </a>
                  }
                />
                <InfoRow label="Phone" value={tenant.phone} />
                <div className="mt-3">
                  <Link
                    href={`/manager/tenants/${tenant.id}`}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View tenant profile →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Tenant record not found.</p>
            )}
          </SectionCard>

          {/* Unit Info */}
          <SectionCard icon={Home} title="Unit" iconColor="text-green-500">
            {unit && property ? (
              <>
                <InfoRow label="Property" value={property.name} />
                <InfoRow label="Unit Number" value={`Unit ${unit.unitNumber}`} />
                <InfoRow label="Bedrooms" value={unit.bedrooms} />
                <InfoRow label="Bathrooms" value={unit.bathrooms} />
                {unit.sqft && <InfoRow label="Square Footage" value={`${unit.sqft.toLocaleString()} sqft`} />}
                <InfoRow label="Floor" value={unit.floor ?? '—'} />
              </>
            ) : (
              <p className="text-sm text-gray-400">Unit record not found.</p>
            )}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Financial Terms */}
          <SectionCard icon={DollarSign} title="Financial Terms" iconColor="text-emerald-500">
            <InfoRow label="Monthly Rent" value={formatCurrency(lease.rentAmount)} />
            <InfoRow label="Security Deposit" value={formatCurrency(lease.deposit)} />
            <InfoRow
              label="Pet Deposit"
              value={
                lease.petDeposit ? formatCurrency(lease.petDeposit) : <span className="text-gray-400">—</span>
              }
            />
          </SectionCard>

          {/* Key Dates */}
          <SectionCard icon={Calendar} title="Key Dates" iconColor="text-purple-500">
            <InfoRow label="Lease Start" value={formatDate(lease.startDate)} />
            <InfoRow label="Lease End" value={formatDate(lease.endDate)} />
            <InfoRow
              label="Signed"
              value={lease.signedAt ? formatDate(lease.signedAt) : <span className="text-gray-400">Not yet</span>}
            />
            <InfoRow
              label="Days Remaining"
              value={
                daysLeft > 0 ? (
                  <span
                    className={
                      daysLeft > 60
                        ? 'text-green-700'
                        : daysLeft >= 30
                        ? 'text-yellow-700'
                        : 'text-red-600'
                    }
                  >
                    {daysLeft} days
                  </span>
                ) : (
                  <span className="text-red-600">Expired</span>
                )
              }
            />
          </SectionCard>

          {/* Policies */}
          <SectionCard icon={PawPrint} title="Lease Policies" iconColor="text-orange-500">
            <InfoRow
              label="Pets Allowed"
              value={
                <span className={lease.petAllowed ? 'text-green-700' : 'text-gray-500'}>
                  {lease.petAllowed ? 'Yes' : 'No'}
                </span>
              }
            />
            {lease.notes && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Notes</p>
                {lease.notes}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Payments Section */}
      <div className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold">
              <span className="flex items-center gap-2">
                <DollarSign size={14} className="text-green-500" />
                Recent Payments
              </span>
              <Link
                href={`/manager/payments/history?leaseId=${leaseId}`}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                View all payments →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No payments recorded yet.</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Due Date', 'Amount Due', 'Paid Amount', 'Status', 'Method', 'Reference'].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3">{formatDate(payment.dueDate)}</td>
                        <td className="px-4 py-3">{formatCurrency(payment.amountDue)}</td>
                        <td className="px-4 py-3">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {payment.method?.replace('_', ' ') ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                          {payment.referenceNumber ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renewal Status */}
      {lease.renewalStatus && (
        <div className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <RefreshCw size={14} className="text-blue-500" />
                Renewal Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {lease.renewalStatus === 'NON_RENEWAL'
                      ? 'Non-Renewal'
                      : lease.renewalStatus === 'RENEWED'
                      ? 'Renewed'
                      : lease.renewalStatus}
                  </p>
                  {lease.notes && (
                    <p className="mt-1 text-sm text-gray-500">{lease.notes}</p>
                  )}
                </div>
                <Link href={`/manager/leases/${leaseId}/renew`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>Renew Lease</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
