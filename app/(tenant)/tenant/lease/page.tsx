import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDays,
  Download,
  MapPin,
  DollarSign,
  PawPrint,
  Clock,
  CheckCircle2,
  RefreshCw,
  XCircle,
  FileText,
} from 'lucide-react'
import { tenants } from '@/lib/mock-data/tenants'
import { leases } from '@/lib/mock-data/leases'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import { LeaseStatus } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { cn } from 'cn'

function leaseStatusStyles(status: LeaseStatus) {
  switch (status) {
    case LeaseStatus.ACTIVE:
      return { bg: 'bg-green-100 text-green-700', label: 'Active' }
    case LeaseStatus.PENDING:
      return { bg: 'bg-yellow-100 text-yellow-700', label: 'Pending' }
    case LeaseStatus.EXPIRED:
      return { bg: 'bg-gray-100 text-gray-600', label: 'Expired' }
    case LeaseStatus.TERMINATED:
      return { bg: 'bg-red-100 text-red-700', label: 'Terminated' }
    default:
      return { bg: 'bg-gray-100 text-gray-600', label: status }
  }
}

export default async function TenantLeasePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id ?? 'user_tenant_001'

  const tenant = tenants.find((t) => t.userId === userId) ?? tenants[0]
  const tenantId = tenant.id

  const lease = leases.find(
    (l) => l.tenantId === tenantId && l.status === LeaseStatus.ACTIVE,
  ) ?? leases[0]

  const unit = units.find((u) => u.id === lease.unitId)
  const property = unit ? properties.find((p) => p.id === unit.propertyId) : undefined

  // Progress calculation
  const now = new Date()
  const start = lease.startDate
  const end = lease.endDate
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = Math.max(0, now.getTime() - start.getTime())
  const progress = Math.min(100, Math.round((elapsedMs / totalMs) * 100))
  const daysRemaining = getDaysUntil(end)

  const statusStyle = leaseStatusStyles(lease.status)
  const isRenewalOffered = lease.renewalStatus === 'OFFERED'
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 90

  const fullAddress = property
    ? `${property.address}, ${property.city}, ${property.state} ${property.zip}`
    : '—'

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Lease</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {property?.name} — Unit {unit?.unitNumber}
          </p>
        </div>
        <a
          href="/mock-docs/lease.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'default' }),
            'gap-2',
          )}
        >
          <Download size={15} />
          Download Lease
        </a>
      </div>

      {/* Status + Date Range */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-3 mb-5">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusStyle.bg}`}>
            {statusStyle.label}
          </span>
          {daysRemaining > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Clock size={13} />
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
            </span>
          )}
        </div>

        {/* Big date range */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className="text-[#2d9d5c] shrink-0" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatDate(lease.startDate)}
            </span>
          </div>
          <span className="text-2xl text-gray-300 font-light">→</span>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            {formatDate(lease.endDate)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Lease start</span>
            <span className="font-medium text-[#2d9d5c]">{progress}% complete</span>
            <span>Lease end</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2d9d5c] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isExpiringSoon && !isRenewalOffered && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <Clock size={15} className="shrink-0" />
            Your lease expires in {daysRemaining} days. Your property manager will be in touch about renewal options.
          </p>
        )}
      </div>

      {/* Financial Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={17} className="text-[#2d9d5c]" />
          Financial Details
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(lease.rentAmount)}</p>
          </div>
          <div className="text-center rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500 mb-1">Security Deposit</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(lease.deposit)}</p>
          </div>
          <div className="text-center rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500 mb-1">Pet Deposit</p>
            <p className="text-xl font-bold text-gray-900">
              {lease.petDeposit ? formatCurrency(lease.petDeposit) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Policies Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={17} className="text-[#2d9d5c]" />
          Lease Policies
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
            lease.petAllowed
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-500',
          )}>
            <PawPrint size={15} />
            Pets {lease.petAllowed ? 'Allowed' : 'Not Allowed'}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-700">
            <CalendarDays size={15} />
            12-Month Lease
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-50 text-purple-700">
            <DollarSign size={15} />
            Rent Due 1st of Month
          </div>
        </div>
        {lease.notes && (
          <p className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            📋 {lease.notes}
          </p>
        )}
      </div>

      {/* Unit Card */}
      {unit && property && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={17} className="text-[#2d9d5c]" />
            Your Unit
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Property</p>
              <p className="text-sm font-semibold text-gray-900">{property.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Unit</p>
              <p className="text-sm font-semibold text-gray-900">#{unit.unitNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Bedrooms</p>
              <p className="text-sm font-semibold text-gray-900">{unit.bedrooms} BD / {unit.bathrooms} BA</p>
            </div>
            {unit.sqft && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Size</p>
                <p className="text-sm font-semibold text-gray-900">{unit.sqft.toLocaleString()} sqft</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            {fullAddress}
          </div>
        </div>
      )}

      {/* Renewal Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <RefreshCw size={17} className="text-[#2d9d5c]" />
          Lease Renewal
        </h2>

        {isRenewalOffered ? (
          <div>
            <div className="mb-4 rounded-xl bg-[#2d9d5c]/10 border border-[#2d9d5c]/20 px-4 py-4">
              <p className="font-semibold text-[#2d9d5c] mb-1">🎉 Renewal offer received!</p>
              <p className="text-sm text-gray-600">
                Your property manager has sent you a renewal offer. Please review and respond below.
              </p>
            </div>
            <div className="flex gap-3">
              <button className={cn(
                buttonVariants({ variant: 'default', size: 'default' }),
                'bg-[#2d9d5c] hover:bg-[#2d9d5c]/80 gap-2',
              )}>
                <CheckCircle2 size={15} />
                Accept Renewal
              </button>
              <button className={cn(
                buttonVariants({ variant: 'destructive', size: 'default' }),
                'gap-2',
              )}>
                <XCircle size={15} />
                Decline
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-4">
            <Clock size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              We'll reach out to you about renewal options <strong>90 days before your lease expires</strong> (around {formatDate(new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000))}). No action needed right now.
            </p>
          </div>
        )}
      </div>

      {/* Download CTA */}
      <div className="rounded-2xl bg-gray-900 p-6 text-white flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-lg">Need a copy of your lease?</p>
          <p className="text-gray-400 text-sm mt-0.5">Download your signed lease agreement as a PDF.</p>
        </div>
        <a
          href="/mock-docs/lease.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Download size={15} />
          Download PDF
        </a>
      </div>
    </div>
  )
}
