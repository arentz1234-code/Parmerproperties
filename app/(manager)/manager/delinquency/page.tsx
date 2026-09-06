import { AlertTriangle, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { getPayments } from '@/lib/actions/payment-actions'
import { getTenants } from '@/lib/actions/tenant-actions'
import { getLeases } from '@/lib/actions/lease-actions'
import { getUnits } from '@/lib/actions/unit-actions'
import { PaymentStatus, LeaseStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const AUTOMATION_RULES = [
  { day: 3, label: 'Day 3: Friendly rent reminder', channel: 'Email' },
  { day: 7, label: 'Day 7: Late payment notice', channel: 'Email + SMS' },
  { day: 14, label: 'Day 14: Pay-or-Quit notice', channel: 'Email' },
  { day: 30, label: 'Day 30: Collections referral', channel: 'Internal' },
]

export default async function DelinquencyPage() {
  const [paymentsResult, tenantsResult, leasesResult, unitsResult] = await Promise.all([
    getPayments({ status: PaymentStatus.OVERDUE }),
    getTenants(),
    getLeases({ status: LeaseStatus.ACTIVE }),
    getUnits(),
  ])

  const overduePayments = paymentsResult.success ? paymentsResult.data : []
  const tenants = tenantsResult.success ? tenantsResult.data : []
  const leases = leasesResult.success ? leasesResult.data : []
  const units = unitsResult.success ? unitsResult.data : []

  const today = new Date('2026-09-05')

  // Build enriched delinquency rows
  const rows = overduePayments.map((payment) => {
    const tenant = tenants.find((t) => t.id === payment.tenantId)
    const lease = leases.find((l) => l.id === payment.leaseId)
    const unit = lease ? units.find((u) => u.id === lease.unitId) : undefined

    const daysOverdue = Math.max(
      0,
      Math.floor((today.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
    )
    const balance = payment.amountDue - payment.amount

    return {
      payment,
      tenant,
      lease,
      unit,
      daysOverdue,
      balance,
    }
  })

  const totalOverdue = rows.reduce((sum, r) => sum + r.balance, 0)
  const delinquentCount = rows.length
  const avgDaysOverdue =
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.daysOverdue, 0) / rows.length)
      : 0

  return (
    <div>
      <PageHeader
        title="Delinquency Management"
        description="Track overdue payments and automate collection notices"
      />

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Overdue Amount"
          value={formatCurrency(totalOverdue)}
          icon={<DollarSign size={18} />}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <StatCard
          title="Delinquent Accounts"
          value={delinquentCount}
          icon={<AlertTriangle size={18} />}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatCard
          title="Average Days Overdue"
          value={`${avgDaysOverdue} days`}
          icon={<Clock size={18} />}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
      </div>

      {/* Overdue Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overdue Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <CheckCircle size={32} className="text-green-400" />
              <p className="font-medium text-gray-700">No overdue accounts</p>
              <p className="text-sm text-gray-500">All tenants are current on rent.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">Tenant</th>
                    <th className="pb-3 pr-4">Unit</th>
                    <th className="pb-3 pr-4 text-right">Rent Amount</th>
                    <th className="pb-3 pr-4 text-right">Days Overdue</th>
                    <th className="pb-3 pr-4 text-right">Balance</th>
                    <th className="pb-3 pr-4">Last Paid</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map(({ payment, tenant, unit, daysOverdue, balance }) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900">
                          {tenant
                            ? `${tenant.firstName} ${tenant.lastName}`
                            : payment.tenantId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tenant?.email}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">
                        {unit ? `Unit ${unit.unitNumber}` : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-900">
                        {formatCurrency(payment.amountDue)}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span
                          className={`font-semibold ${
                            daysOverdue >= 14
                              ? 'text-red-600'
                              : daysOverdue >= 7
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {daysOverdue}d
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-red-600">
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {payment.paidAt ? formatDate(payment.paidAt) : '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200">
                            Send Notice
                          </button>
                          <button className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 border border-green-200">
                            Mark Paid
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {AUTOMATION_RULES.map((rule) => (
              <div key={rule.day} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{rule.label}</p>
                  <p className="text-xs text-gray-500">Channel: {rule.channel}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Enabled
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
