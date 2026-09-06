import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { PrintButton } from '@/components/reports/print-button'
import { getRentRoll } from '@/lib/actions/payment-actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PaymentStatus } from '@/types'

export default async function RentRollReportPage() {
  const result = await getRentRoll()
  const rows = result.success ? result.data : []

  const totalRentDue = rows.reduce((sum, r) => sum + (r.lease?.rentAmount ?? 0), 0)
  const totalPaid = rows.reduce((sum, r) => {
    if (!r.currentPayment) return sum
    if (
      r.currentPayment.status === PaymentStatus.PAID ||
      r.currentPayment.status === PaymentStatus.PARTIAL
    ) {
      return sum + r.currentPayment.amount
    }
    return sum
  }, 0)
  const totalBalance = rows.reduce((sum, r) => sum + r.balance, 0)

  return (
    <div>
      <PageHeader title="Rent Roll Report" description="September 2026 — All units">
        <PrintButton />
        <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Export CSV
        </button>
      </PageHeader>

      {/* Date Selector (UI only) */}
      <Card className="mb-5">
        <CardContent className="flex items-center gap-4 py-3">
          <span className="text-sm font-medium text-gray-700">Report Period:</span>
          <input
            type="month"
            defaultValue="2026-09"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
            readOnly
          />
        </CardContent>
      </Card>

      {/* Rent Roll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Rent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Unit</th>
                  <th className="pb-3 pr-4">Property</th>
                  <th className="pb-3 pr-4">Tenant</th>
                  <th className="pb-3 pr-4 text-right">Rent Due</th>
                  <th className="pb-3 pr-4 text-right">Paid</th>
                  <th className="pb-3 pr-4 text-right">Balance</th>
                  <th className="pb-3 pr-4">Method</th>
                  <th className="pb-3">Date Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(({ unit, property, tenant, lease, currentPayment, balance }) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      Unit {unit.unitNumber}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{property.name}</td>
                    <td className="py-3 pr-4">
                      {tenant ? (
                        <p className="text-gray-900">
                          {tenant.firstName} {tenant.lastName}
                        </p>
                      ) : (
                        <span className="text-gray-400 italic">Vacant</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right text-gray-700">
                      {lease ? formatCurrency(lease.rentAmount) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {currentPayment ? (
                        <span
                          className={
                            currentPayment.status === PaymentStatus.PAID
                              ? 'font-semibold text-green-600'
                              : 'text-orange-600'
                          }
                        >
                          {formatCurrency(currentPayment.amount)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {balance > 0 ? (
                        <span className="font-medium text-red-600">{formatCurrency(balance)}</span>
                      ) : balance === 0 && lease ? (
                        <span className="text-green-600">—</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {currentPayment?.method ?? '—'}
                    </td>
                    <td className="py-3 text-gray-600">
                      {currentPayment?.paidAt ? formatDate(currentPayment.paidAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 font-semibold">
                  <td colSpan={3} className="pt-3 pr-4 text-gray-900">
                    Totals
                  </td>
                  <td className="pt-3 pr-4 text-right text-gray-900">
                    {formatCurrency(totalRentDue)}
                  </td>
                  <td className="pt-3 pr-4 text-right text-green-600">
                    {formatCurrency(totalPaid)}
                  </td>
                  <td className="pt-3 pr-4 text-right text-red-600">
                    {formatCurrency(totalBalance)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
