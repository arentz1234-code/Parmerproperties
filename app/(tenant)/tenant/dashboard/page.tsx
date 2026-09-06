import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  Wrench,
  MessageCircle,
  Calendar,
  AlertTriangle,
  Shield,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { tenants } from '@/lib/mock-data/tenants'
import { leases } from '@/lib/mock-data/leases'
import { payments } from '@/lib/mock-data/payments'
import { maintenanceRequests } from '@/lib/mock-data/maintenance'
import { messages } from '@/lib/mock-data/messages'
import { units } from '@/lib/mock-data/units'
import { properties } from '@/lib/mock-data/properties'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import { PaymentStatus, MaintenanceStatus } from '@/types'

function getPaymentStatusColor(status: string) {
  if (status === 'PAID') return 'bg-green-100 text-green-700'
  if (status === 'OVERDUE') return 'bg-red-100 text-red-700'
  if (status === 'PARTIAL') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-600'
}

function getMaintenanceStatusColor(status: string) {
  if (status === 'COMPLETED') return 'bg-green-100 text-green-700'
  if (status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700'
  if (status === 'OPEN') return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-600'
}

export default async function TenantDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = (session.user as { id?: string }).id ?? 'user_tenant_001'

  // Look up tenant
  const tenant = tenants.find((t) => t.userId === userId) ?? tenants[0]
  const tenantId = tenant.id

  // Active lease for this tenant
  const lease = leases.find(
    (l) => l.tenantId === tenantId && l.status === 'ACTIVE',
  ) ?? leases[0]

  // Unit + property
  const unit = units.find((u) => u.id === lease.unitId)
  const property = properties.find((p) => p.id === unit?.propertyId)

  // Payments
  const tenantPayments = payments
    .filter((p) => p.tenantId === tenantId)
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())

  const currentPayment = tenantPayments.find(
    (p) => p.status === PaymentStatus.OVERDUE || p.status === PaymentStatus.PENDING || p.status === PaymentStatus.PARTIAL,
  )
  const overduePayment = tenantPayments.find((p) => p.status === PaymentStatus.OVERDUE)
  const recentPayments = tenantPayments.filter((p) => p.status === PaymentStatus.PAID).slice(0, 3)

  // Balance
  const currentBalance = currentPayment
    ? currentPayment.amountDue - currentPayment.amount + (currentPayment.lateFee ?? 0)
    : 0

  // Maintenance
  const tenantMaintenance = maintenanceRequests
    .filter((m) => m.requestedBy === tenantId || m.requestedBy === `user_${tenantId}`)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  const openRequests = tenantMaintenance.filter(
    (m) => m.status !== MaintenanceStatus.COMPLETED && m.status !== MaintenanceStatus.CANCELLED,
  ).length
  const recentMaintenance = tenantMaintenance.slice(0, 2)

  // Messages
  const unreadMessages = messages.filter(
    (m) => m.receiverIds.includes(userId) && !m.readAt,
  ).length

  // Lease progress
  const leaseStart = lease.startDate
  const leaseEnd = lease.endDate
  const totalDays = (leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24)
  const elapsed = Math.max(
    0,
    (new Date().getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24),
  )
  const leaseProgress = Math.min(100, Math.round((elapsed / totalDays) * 100))
  const daysUntilEnd = getDaysUntil(leaseEnd)

  // Next payment due
  const nextPaymentDue = currentPayment
    ? getDaysUntil(currentPayment.dueDate)
    : 26 // next month approximation

  // Insurance expiring (mock — 30 days for demo)
  const insuranceExpiringSoon = false

  const firstName = tenant.firstName

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-0.5">
          Here's what's happening with your home.
        </p>
      </div>

      {/* Alert banners */}
      {overduePayment && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">You have an overdue payment</p>
            <p className="text-red-700 text-sm mt-0.5">
              {formatCurrency(overduePayment.amountDue - overduePayment.amount + (overduePayment.lateFee ?? 0))} is past due.
              {overduePayment.lateFee ? ` Includes a late fee of ${formatCurrency(overduePayment.lateFee)}.` : ''}
            </p>
          </div>
          <Link
            href="/tenant/pay-rent"
            className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Pay Now
          </Link>
        </div>
      )}

      {insuranceExpiringSoon && (
        <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <Shield size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">Renter's insurance expiring soon</p>
            <p className="text-yellow-700 text-sm mt-0.5">
              Your policy expires in 30 days. Please update your insurance to avoid a policy gap.
            </p>
          </div>
          <Link
            href="/tenant/insurance"
            className="shrink-0 rounded-lg bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-700 transition-colors"
          >
            Update
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/tenant/pay-rent" className="group">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-[#2d9d5c]/30 transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded-xl bg-[#2d9d5c]/10 flex items-center justify-center">
                <CreditCard size={20} className="text-[#2d9d5c]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {currentBalance > 0 ? formatCurrency(currentBalance) : '$0.00'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Current Balance</p>
          </div>
        </Link>

        <Link href="/tenant/pay-rent" className="group">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-[#2d9d5c]/30 transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {nextPaymentDue <= 0 ? 'Today' : nextPaymentDue <= 7 ? `${nextPaymentDue}d` : `${nextPaymentDue}d`}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Next Payment Due</p>
          </div>
        </Link>

        <Link href="/tenant/maintenance" className="group">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-[#2d9d5c]/30 transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Wrench size={20} className="text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{openRequests}</p>
            <p className="text-sm text-gray-500 mt-0.5">Open Requests</p>
          </div>
        </Link>

        <Link href="/tenant/messages" className="group">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-[#2d9d5c]/30 transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <MessageCircle size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
            <p className="text-sm text-gray-500 mt-0.5">Unread Messages</p>
          </div>
        </Link>
      </div>

      {/* Lease countdown */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Lease Progress</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {property?.name} — Unit {unit?.unitNumber}
            </p>
          </div>
          <Link
            href="/tenant/lease"
            className="flex items-center gap-1 text-sm text-[#2d9d5c] font-medium hover:underline"
          >
            View Lease <ChevronRight size={14} />
          </Link>
        </div>

        {/* Date display */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Start</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatDate(leaseStart)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-[#2d9d5c]">{leaseProgress}% complete</p>
            <p className="text-xs text-gray-500">
              {daysUntilEnd > 0 ? `${daysUntilEnd} days left` : 'Expired'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">End</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatDate(leaseEnd)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2d9d5c] rounded-full transition-all"
            style={{ width: `${leaseProgress}%` }}
          />
        </div>

        {daysUntilEnd <= 90 && daysUntilEnd > 0 && (
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
            <Clock size={13} />
            Your lease expires soon. Watch for a renewal offer from your property manager.
          </p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Payments</h2>
            <Link
              href="/tenant/pay-rent"
              className="text-sm text-[#2d9d5c] font-medium hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-400">No payments found.</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(payment.dueDate)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status === PaymentStatus.PAID ? 'Paid' : payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Maintenance Updates</h2>
            <Link
              href="/tenant/maintenance"
              className="text-sm text-[#2d9d5c] font-medium hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {recentMaintenance.length === 0 ? (
            <div className="text-center py-4">
              <Wrench size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No maintenance requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMaintenance.map((req) => (
                <div key={req.id} className="flex items-start justify-between py-1">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{req.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(req.updatedAt)}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${getMaintenanceStatusColor(req.status)}`}
                  >
                    {req.status === MaintenanceStatus.IN_PROGRESS
                      ? 'In Progress'
                      : req.status === MaintenanceStatus.COMPLETED
                      ? 'Done'
                      : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/tenant/maintenance/new"
            className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-sm text-gray-400 hover:border-[#2d9d5c] hover:text-[#2d9d5c] transition-colors"
          >
            + Submit a request
          </Link>
        </div>
      </div>
    </div>
  )
}
