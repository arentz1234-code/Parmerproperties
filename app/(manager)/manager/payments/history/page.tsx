import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { getPayments } from '@/lib/actions/payment-actions'
import { getTenants } from '@/lib/actions/tenant-actions'
import { getLeases } from '@/lib/actions/lease-actions'
import { getUnits } from '@/lib/actions/unit-actions'
import { getProperties } from '@/lib/actions/property-actions'
import { PAYMENT_STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from 'cn'

const STATUS_FILTER_LABELS = [
  { value: '', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PARTIAL', label: 'Partial' },
]

export default async function PaymentHistoryPage() {
  const [paymentsResult, tenantsResult, leasesResult, unitsResult, propertiesResult] =
    await Promise.all([
      getPayments(),
      getTenants(),
      getLeases(),
      getUnits(),
      getProperties(),
    ])

  const payments = paymentsResult.success ? paymentsResult.data : []
  const tenants = tenantsResult.success ? tenantsResult.data : []
  const leases = leasesResult.success ? leasesResult.data : []
  const units = unitsResult.success ? unitsResult.data : []
  const properties = propertiesResult.success ? propertiesResult.data : []

  // Sort by date descending
  const sorted = [...payments].sort(
    (a, b) => (b.paidAt ?? b.dueDate).getTime() - (a.paidAt ?? a.dueDate).getTime(),
  )

  return (
    <div>
      <PageHeader title="Payment History" description="Complete record of all transactions" />

      {/* Filter row (static) */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Filter by status:</span>
        {STATUS_FILTER_LABELS.map((f) => (
          <span
            key={f.value}
            className={cn(
              'cursor-default rounded-full px-3 py-1 text-sm font-medium',
              f.value === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {f.label}
          </span>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Tenant</th>
                  <th className="pb-3 pr-4">Unit</th>
                  <th className="pb-3 pr-4 text-right">Amount</th>
                  <th className="pb-3 pr-4">Method</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Reference #</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-500">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  sorted.map((payment) => {
                    const tenant = tenants.find((t) => t.id === payment.tenantId)
                    const lease = leases.find((l) => l.id === payment.leaseId)
                    const unit = lease ? units.find((u) => u.id === lease.unitId) : undefined
                    const property = unit
                      ? properties.find((p) => p.id === unit.propertyId)
                      : undefined

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-700">
                          {formatDate(payment.paidAt ?? payment.dueDate)}
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">
                            {tenant
                              ? `${tenant.firstName} ${tenant.lastName}`
                              : payment.tenantId}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {unit ? `Unit ${unit.unitNumber}` : '—'}
                          {property && (
                            <span className="block text-xs text-gray-400">{property.name}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          {payment.amount !== payment.amountDue && (
                            <p className="text-xs text-gray-500">
                              of {formatCurrency(payment.amountDue)}
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {payment.method ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                          {payment.referenceNumber ?? '—'}
                        </td>
                        <td className="py-3 text-gray-500 text-xs max-w-[200px] truncate">
                          {payment.notes ?? '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
