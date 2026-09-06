'use client'

import Link from 'next/link'
import { cn } from 'cn'
import { StatusBadge } from '@/components/shared/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { PaymentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { RentRollRow } from '@/lib/mock-data'

interface RentRollTableProps {
  rows: RentRollRow[]
}

export function RentRollTable({ rows }: RentRollTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-gray-400">No rent roll data available.</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
          <tr>
            {[
              'Unit',
              'Property',
              'Tenant',
              'Rent Due',
              'Status',
              'Due Date',
              'Paid',
              'Balance',
              'Actions',
            ].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const isPaid =
              row.currentPayment?.status === PaymentStatus.PAID
            const hasBalance = row.balance > 0
            const balanceClass = hasBalance
              ? 'text-red-600 font-semibold'
              : 'text-green-700 font-semibold'

            return (
              <tr key={row.unit.id} className="bg-white transition-colors hover:bg-blue-50/40">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  Unit {row.unit.unitNumber}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {row.property.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {row.tenant
                    ? `${row.tenant.firstName} ${row.tenant.lastName}`
                    : <span className="text-gray-400">Vacant</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-900">
                  {row.lease ? formatCurrency(row.lease.rentAmount) : <span className="text-gray-400">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.currentPayment ? (
                    <StatusBadge status={row.currentPayment.status} />
                  ) : row.lease ? (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      No charge
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                      Vacant
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {row.currentPayment ? formatDate(row.currentPayment.dueDate) : <span className="text-gray-400">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-600">
                  {row.currentPayment?.paidAt
                    ? formatDate(row.currentPayment.paidAt)
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className={cn('whitespace-nowrap px-4 py-3 tabular-nums', balanceClass)}>
                  {row.lease ? formatCurrency(row.balance) : <span className="text-gray-400 font-normal">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.lease && (
                    <Link
                      href={`/manager/payments/record?leaseId=${row.lease.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'xs' })}
                    >
                      Record Payment
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
